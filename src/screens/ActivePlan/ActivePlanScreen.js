import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Video } from 'expo-av';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  cachePlan,
  ensureVideosDownloaded,
  getExerciseVideoUri,
  loadCachedPlan,
} from '../../services/offlinePlanService';
//const API_URL = 'https://api.mogym.ir';
const API_URL = 'http://185.252.86.164:8083';

const palette = {
  bgDark: '#0e1015',
  cardDark: '#1a1d2e',
  borderDark: '#273043',
  textDark: '#ffffff',
  subDark: '#cbd5e1',
  textLight: '#0f172a',
  subLight: '#475569',
  primary: '#2563eb',
  ok: '#10b981',
  warn: '#f59e0b',
  supBorder: '#0ea5a5',
  dropBorder: '#d97706',
  supBg: '#10b98122',
  dropBg: '#f59e0b22',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ActivePlanScreen({ route }) {
  const [dark, setDark] = useState(true);
  const colors = useMemo(
    () => ({
      bg: dark ? palette.bgDark : '#fff',
      card: dark ? palette.cardDark : '#fff',
      border: dark ? palette.borderDark : '#e5e7eb',
      text: dark ? palette.textDark : palette.textLight,
      sub: dark ? palette.subDark : palette.subLight,
    }),
    [dark]
  );

  const [planId, setPlanId] = useState(route?.params?.planId ?? null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [selectedSection, setSelectedSection] = useState('workout'); // 'workout' | 'nutrition'

  // تمرین
  const [days, setDays] = useState([]);
  const [warmupCommon, setWarmupCommon] = useState([]);

  // تغذیه
  const [nutriDays, setNutriDays] = useState([]);
  const [nutriTotals, setNutriTotals] = useState(null);

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // وضعیت ست‌ها
  const [done, setDone] = useState({});

  // وضعیت مدال ویدئو
  const [videoModal, setVideoModal] = useState({
    visible: false,
    url: null,
    title: '',
  });

  const openVideo = (url, title) => {
    if (!url) return;
    setVideoModal({ visible: true, url, title: title || '' });
  };

  const closeVideo = () => {
    setVideoModal({ visible: false, url: null, title: '' });
  };

// دادهٔ خام برنامه تمرین (Result.WorkoutDetails) → شکل مناسب state
function mapWorkoutData(rawWorkout) {
  const rawDays = rawWorkout?.WorkoutDetails || [];
  const warmup = rawWorkout?.Warmup || [];

  const mappedDays = (rawDays || []).map((d, dayIdx) => {
    const blocks = (d?.WorkoutGroups || []).map((g, gIdx) => {
      const type = (g?.Type || 'Normal').toString();
      const exs = (g?.ExerciseRecords || []).map((ex, exIdx) => ({
        Name: ex?.Name,
        Sets: Number(ex?.Sets || 0),
        Reps: ex?.Reps,
        Rest: ex?.RestSeconds ? `${ex.RestSeconds} ثانیه` : '-',
        Description: ex?.Description,
        VideoUrl: ex?.VideoUrl,
        ExerciseId: ex?.ExerciseId,
        keyBase: `day-${dayIdx}-blk-${gIdx}-ex-${exIdx}`,
      }));
      return { type, exercises: exs };
    });

    return {
      Day: dayIdx + 1,
      Title: d?.DayOfWeek
        ? `${d.DayOfWeek}${d?.MuscleGroup ? ` - ${d.MuscleGroup}` : ''}`
        : `روز ${dayIdx + 1}`,
      Blocks: blocks,
    };
  });

  return { days: mappedDays, warmup };
}

// دادهٔ خام تغذیه (Result از nutrition) → state
function mapNutritionData(rawNutrition) {
  const days = rawNutrition?.Days || [];
  const mappedDays = (days || []).map((d, idx) => ({
    Day: idx + 1,
    Title: d?.Day || `روز ${idx + 1}`,
    Meals: (d?.Meals || []).map((m) => ({
      MealType: m?.MealType,
      Options: m?.Options || [],
      Supplements: m?.Supplements || [],
    })),
  }));

  const totals = {
    BMR: rawNutrition?.BMR,
    TDEE: rawNutrition?.TDEE,
    Calories: rawNutrition?.TotalCalories,
    Protein: rawNutrition?.TotalProteinGrams,
    Carbs: rawNutrition?.TotalCarbsGrams,
    Fat: rawNutrition?.TotalFatGrams,
  };

  return { nutriDays: mappedDays, nutriTotals: totals };
}




  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('activePlan.done');
        if (raw) setDone(JSON.parse(raw) || {});
      } catch {}
    })();
  }, []);

  const toggleSet = (key) => {
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem('activePlan.done', JSON.stringify(next)).catch(
        () => {}
      );
      return next;
    });
  };

  const parseRepsToArray = (reps) => {
    if (!reps || typeof reps !== 'string') return [];
    return reps
      .split('(')[0]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // ---------- LOADERS ----------

  const loadWorkout = useCallback(async (pid, token) => {
    const res = await fetch(`${API_URL}/api/plan/${pid}/workout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('دریافت برنامه ناموفق بود.');
    const data = await res.json();

    const rawDays = data?.Result?.WorkoutDetails || data?.WorkoutDetails || [];
    const warmup = data?.Result?.Warmup || data?.Warmup || [];

    const mappedDays = (rawDays || []).map((d, dayIdx) => {
      const blocks = (d?.WorkoutGroups || []).map((g, gIdx) => {
        const type = (g?.Type || 'Normal').toString();
        const exs = (g?.ExerciseRecords || []).map((ex, exIdx) => ({
          Name: ex?.Name,
          Sets: Number(ex?.Sets || 0),
          Reps: ex?.Reps,
          Rest: ex?.RestSeconds ? `${ex.RestSeconds} ثانیه` : '-',
          Description: ex?.Description,
          VideoUrl: ex?.VideoUrl,
          ExerciseId: ex?.ExerciseId,
          keyBase: `day-${dayIdx}-blk-${gIdx}-ex-${exIdx}`,
        }));
        return { type, exercises: exs };
      });

      return {
        Day: dayIdx + 1,
        Title: d?.DayOfWeek
          ? `${d.DayOfWeek}${d?.MuscleGroup ? ` - ${d.MuscleGroup}` : ''}`
          : `روز ${dayIdx + 1}`,
        Blocks: blocks,
      };
    });

    setDays(mappedDays);
    setWarmupCommon(warmup);
  }, []);

  const loadNutrition = useCallback(async (pid, token) => {
    try {
      const res = await fetch(`${API_URL}/api/plan/${pid}/meal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setNutriDays([]);
        setNutriTotals(null);
        return;
      }

      const data = await res.json();
      const r = data?.Result || {};

      const totals = {
        BMR: r?.BMR,
        TDEE: r?.TDEE,
        Calories: r?.TotalCalories,
        Protein: r?.TotalProteinGrams,
        Carbs: r?.TotalCarbsGrams,
        Fat: r?.TotalFatGrams,
      };

      const mappedDays = (r?.Days || []).map((d, idx) => ({
        Day: idx + 1,
        Title: d?.Day || `روز ${idx + 1}`,
        Meals: (d?.Meals || []).map((m) => ({
          MealType: m?.MealType,
          Options: m?.Options || [],
          Supplements: m?.Supplements || [],
        })),
      }));

      setNutriDays(mappedDays);
      setNutriTotals(totals);
    } catch {
      setNutriDays([]);
      setNutriTotals(null);
    }
  }, []);

   const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);

      const pid = planId ?? (await AsyncStorage.getItem('planId'));
      if (!pid) {
        setError('برنامه‌ای پیدا نشد. ابتدا یک برنامه بسازید.');
        setLoading(false);
        return;
      }
      setPlanId(pid);

      const token = await AsyncStorage.getItem('token');

      // وضعیت شبکه
      const netState = await NetInfo.fetch();
      const isOnline =
        netState.isConnected && netState.isInternetReachable !== false;

      if (!isOnline) {
        // --- حالت آفلاین: از کش بخوانیم
        const cached = await loadCachedPlan(pid);
        if (!cached || !cached.workout) {
          setError('برای نمایش برنامه در حالت آفلاین، یک‌بار با اینترنت وارد شوید.');
          setLoading(false);
          return;
        }

        const workoutMapped = mapWorkoutData(cached.workout);
        setDays(workoutMapped.days);
        setWarmupCommon(workoutMapped.warmup || []);

        if (cached.nutrition) {
          const nutMapped = mapNutritionData(cached.nutrition);
          setNutriDays(nutMapped.nutriDays);
          setNutriTotals(nutMapped.nutriTotals);
        } else {
          setNutriDays([]);
          setNutriTotals(null);
        }

        setLoading(false);
        setRefreshing(false);
        return;
      }

      // --- حالت آنلاین: داده‌ها را از API بگیر، در کش ذخیره کن، ویدئوها را دانلود کن

      // 1) برنامه تمرین
      const wRes = await fetch(`${API_URL}/api/plan/${pid}/workout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!wRes.ok) throw new Error('دریافت برنامه تمرین ناموفق بود.');
      const wJson = await wRes.json();
      const rawWorkout = wJson?.Result || wJson || {};

      const workoutMapped = mapWorkoutData(rawWorkout);
      setDays(workoutMapped.days);
      setWarmupCommon(workoutMapped.warmup || []);

      // 2) برنامه تغذیه
      const nRes = await fetch(`${API_URL}/api/plan/${pid}/meal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let rawNutrition = null;
      if (nRes.ok) {
        const nJson = await nRes.json();
        rawNutrition = nJson?.Result || nJson || {};
        const nutMapped = mapNutritionData(rawNutrition);
        setNutriDays(nutMapped.nutriDays);
        setNutriTotals(nutMapped.nutriTotals);
      } else {
        setNutriDays([]);
        setNutriTotals(null);
      }

      // 3) کش‌کردن کل برنامه برای استفاده آفلاین
      await cachePlan(pid, rawWorkout, rawNutrition);

      // 4) دانلود خودکار ویدئوها برای حالت آفلاین
      await ensureVideosDownloaded(pid, rawWorkout);

    } catch (e) {
      setError(e?.message || 'خطا در دریافت برنامه');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planId]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  // ---------- UI HELPERS ----------

  const SetChip = ({ label, active, onPress, accent }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? accent : colors.border,
        backgroundColor: active ? `${accent}22` : 'transparent',
        marginLeft: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontFamily: 'Vazir-Medium', color: active ? accent : colors.text }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const WarmupBox = ({ warmup = [] }) => {
    if (!warmup?.length) return null;
    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'Vazir-Bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'right',
          }}
        >
          گرم‌کردن
        </Text>
        {warmup.map((w, i) => (
          <View
            key={w?.Id || i}
            style={{
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
              borderBottomWidth: i === warmup.length - 1 ? 0 : 1,
              borderColor: colors.border,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                fontFamily: 'Vazir-Regular',
                color: colors.text,
                flex: 1,
                textAlign: 'right',
                marginLeft: 8,
              }}
            >
              {w?.Name || '-'}
            </Text>
            <Text style={{ fontFamily: 'Vazir-Regular', color: colors.sub }}>
              {w?.SetOrDuration || '-'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

const ExerciseThumb = ({ ex, planId }) => {
  const [uri, setUri] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const u = await getExerciseVideoUri(planId, ex);
      if (isMounted) setUri(u);
    })();
    return () => { isMounted = false; };
  }, [ex, planId]);

  if (!uri) return null;

  return (
    <TouchableOpacity onPress={() => openVideo(uri, ex.Name)}>
      <Image
        source={{ uri }}
        style={{ width: 90, height: 90, borderRadius: 10, marginLeft: 8 }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};




  const ExerciseCard = ({ ex, idxKey }) => {
    const sets = Number(ex?.Sets || 0);
    const reps = ex?.Reps;
    const rest = ex?.Rest;

    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontFamily: 'Vazir-Bold',
              color: colors.text,
              flex: 1,
              textAlign: 'right',
            }}
          >
            {ex?.Name || 'حرکت'}
          </Text>
<ExerciseThumb ex={ex} planId={planId} />
        </View>

        {ex?.Description ? (
          <Text
            style={{
              fontFamily: 'Vazir-Regular',
              color: colors.sub,
              textAlign: 'right',
              marginBottom: 8,
            }}
          >
            {ex.Description}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap' }}>
          {Array.from({ length: sets || 1 }).map((_, sIdx) => {
            const key = `${idxKey}-set-${sIdx}`;
            return (
              <SetChip
                key={sIdx}
                label={`ست ${sIdx + 1}`}
                active={!!done[key]}
                onPress={() => toggleSet(key)}
                accent={palette.ok}
              />
            );
          })}
        </View>

        <View
          style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: 'Vazir-Regular',
              color: colors.sub,
              textAlign: 'right',
            }}
          >
            تکرار: {Array.isArray(reps) ? reps.join(' - ') : reps || '-'}
          </Text>
          <Text style={{ fontFamily: 'Vazir-Regular', color: colors.sub }}>
            استراحت: {rest || '-'}
          </Text>
        </View>
      </View>
    );
  };

  const SupersetCard = ({ exs, baseKey }) => {
    const commonSets = Math.max(
      1,
      Math.min(...exs.map((e) => Number(e.Sets || 0) || 1))
    );

    return (
      <View
        style={{
          backgroundColor: palette.supBg,
          borderWidth: 1,
          borderColor: palette.supBorder,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'Vazir-Bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'right',
          }}
        >
          سوپرست (پشت‌سرهم)
        </Text>

        {exs.map((ex, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <View
              style={{
                flexDirection: 'row-reverse',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Vazir-Medium',
                  color: colors.text,
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {ex?.Name || 'حرکت'}
              </Text>
<ExerciseThumb ex={ex} planId={planId} />
            </View>
            {ex?.Description ? (
              <Text
                style={{
                  fontFamily: 'Vazir-Regular',
                  color: colors.sub,
                  textAlign: 'right',
                }}
              >
                {ex.Description}
              </Text>
            ) : null}
          </View>
        ))}

        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap' }}>
          {Array.from({ length: commonSets }).map((_, sIdx) => {
            const key = `${baseKey}-superset-set-${sIdx}`;
            return (
              <SetChip
                key={sIdx}
                label={`ست ${sIdx + 1}`}
                active={!!done[key]}
                onPress={() => toggleSet(key)}
                accent={palette.supBorder}
              />
            );
          })}
        </View>

        <View
          style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: 'Vazir-Regular',
              color: colors.sub,
              textAlign: 'right',
            }}
          >
            تکرار: {exs[0]?.Reps || '-'}
          </Text>
          <Text style={{ fontFamily: 'Vazir-Regular', color: colors.sub }}>
            استراحت: {exs[0]?.Rest || '-'}
          </Text>
        </View>
      </View>
    );
  };

  const DropsetCard = ({ ex, baseKey }) => {
    const repsArr = parseRepsToArray(ex?.Reps);
    const hasBreakdown = repsArr.length > 0;
    const items = hasBreakdown
      ? repsArr
      : Array.from({ length: Number(ex?.Sets || 1) }).map(() => ex?.Reps || '-');

    return (
      <View
        style={{
          backgroundColor: palette.dropBg,
          borderWidth: 1,
          borderColor: palette.dropBorder,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'Vazir-Bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'right',
          }}
        >
          دراپ‌ست (کاهش وزنه)
        </Text>

        <View
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontFamily: 'Vazir-Medium',
              color: colors.text,
              flex: 1,
              textAlign: 'right',
            }}
          >
            {ex?.Name || 'حرکت'}
          </Text>
<ExerciseThumb ex={ex} planId={planId} />
        </View>

        {ex?.Description ? (
          <Text
            style={{
              fontFamily: 'Vazir-Regular',
              color: colors.sub,
              textAlign: 'right',
              marginBottom: 8,
            }}
          >
            {ex.Description}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap' }}>
          {items.map((label, sIdx) => {
            const key = `${baseKey}-dropset-${sIdx}`;
            return (
              <SetChip
                key={sIdx}
                label={`ست ${sIdx + 1} (${label})`}
                active={!!done[key]}
                onPress={() => toggleSet(key)}
                accent={palette.dropBorder}
              />
            );
          })}
        </View>

        <View
          style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: 'Vazir-Regular',
              color: colors.sub,
              textAlign: 'right',
            }}
          >
            تکرار: {ex?.Reps || '-'}
          </Text>
          <Text style={{ fontFamily: 'Vazir-Regular', color: colors.sub }}>
            استراحت: {ex?.Rest || '-'}
          </Text>
        </View>
      </View>
    );
  };

  const WorkoutContent = () => {
    const d = days[activeDayIndex] || {};
    return (
      <>
        <WarmupBox warmup={warmupCommon} />
        {(d?.Blocks || []).map((blk, bIdx) => {
          const baseKey = `day-${activeDayIndex}-blk-${bIdx}`;
          const t = (blk.type || '').toLowerCase();

          if (t === 'superset') {
            return <SupersetCard key={bIdx} exs={blk.exercises} baseKey={baseKey} />;
          }
          if (t === 'dropset') {
            const ex = blk.exercises?.[0] || {};
            return <DropsetCard key={bIdx} ex={ex} baseKey={baseKey} />;
          }

          return (
            <View key={bIdx}>
              {(blk.exercises || []).map((ex, exIdx) => (
                <ExerciseCard key={exIdx} ex={ex} idxKey={`${baseKey}-ex-${exIdx}`} />
              ))}
            </View>
          );
        })}
      </>
    );
  };

  // -------- تغذیه --------

  const mapMealType = (type) => {
    const dict = {
      Breakfast: 'صبحانه',
      MorningSnack: 'میان‌وعده صبح',
      Lunch: 'ناهار',
      AfternoonSnack: 'میان‌وعده عصر',
      Dinner: 'شام',
      EveningSnack: 'میان‌وعده شب',
    };
    return dict[type] || type;
  };

  const NutritionContent = () => {
    const d = nutriDays?.[0] || {};
    const meals = d?.Meals || [];

    if (!meals.length) {
      return (
        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Vazir-Regular',
              color: colors.sub,
              textAlign: 'right',
            }}
          >
            برنامه تغذیه‌ای یافت نشد.
          </Text>
        </View>
      );
    }

    const MacroRow = ({ label, value }) => (
      <View
        style={{
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <Text style={{ fontFamily: 'Vazir-Regular', color: colors.sub }}>{label}</Text>
        <Text style={{ fontFamily: 'Vazir-Medium', color: colors.text }}>
          {value ?? '-'}
        </Text>
      </View>
    );

    const MealCard = ({ meal }) => (
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'Vazir-Bold',
            color: colors.text,
            marginBottom: 10,
            textAlign: 'right',
          }}
        >
          🍽️ {mapMealType(meal?.MealType)}
        </Text>

        {(meal?.Options || []).map((opt, i) => (
          <View
            key={i}
            style={{
              borderTopWidth: i ? 1 : 0,
              borderColor: colors.border,
              paddingTop: i ? 8 : 0,
              marginTop: i ? 8 : 0,
            }}
          >
            <Text
              style={{
                fontFamily: 'Vazir-Medium',
                color: colors.text,
                marginBottom: 6,
                textAlign: 'right',
              }}
            >
              گزینه {opt.GroupId}:
            </Text>

            {(opt.Items || []).map((it, j) => (
              <Text
                key={j}
                style={{
                  fontFamily: 'Vazir-Regular',
                  color: colors.sub,
                  textAlign: 'right',
                  lineHeight: 22,
                }}
              >
                • {it.Name} — {it.Quantity}
              </Text>
            ))}
          </View>
        ))}

        {(meal?.Supplements || []).length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text
              style={{
                fontFamily: 'Vazir-Medium',
                color: palette.ok,
                marginBottom: 4,
                textAlign: 'right',
              }}
            >
              💊 مکمل‌ها:
            </Text>
            {meal.Supplements.map((s, k) => (
              <Text
                key={k}
                style={{
                  fontFamily: 'Vazir-Regular',
                  color: colors.sub,
                  textAlign: 'right',
                }}
              >
                • {s.Name} — {s.Quantity}
              </Text>
            ))}
          </View>
        )}
      </View>
    );

    return (
      <>
        {nutriTotals ? (
          <View
            style={{
              backgroundColor: palette.supBg,
              borderWidth: 1,
              borderColor: palette.supBorder,
              borderRadius: 16,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: 'Vazir-Bold',
                color: colors.text,
                marginBottom: 8,
                textAlign: 'right',
              }}
            >
              🔹 خلاصه تغذیه روزانه
            </Text>
            <MacroRow label="کالری کل" value={nutriTotals.Calories} />
            <MacroRow label="پروتئین (گرم)" value={nutriTotals.Protein} />
            <MacroRow label="کربوهیدرات (گرم)" value={nutriTotals.Carbs} />
            <MacroRow label="چربی (گرم)" value={nutriTotals.Fat} />
          </View>
        ) : null}

        {meals.map((m, i) => (
          <MealCard key={i} meal={m} />
        ))}
      </>
    );
  };

  // ---------- RENDER ----------

  const isVideoMp4 = (url) =>
    url && typeof url === 'string' && url.toLowerCase().endsWith('.mp4');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Vazir-Bold',
            fontSize: 18,
            color: colors.text,
          }}
        >
          برنامه فعال
        </Text>
        <TouchableOpacity
          onPress={() => setDark((v) => !v)}
          style={{
            padding: 10,
            borderRadius: 9999,
            backgroundColor: dark ? '#141827' : '#f1f5f9',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.sub }}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={palette.primary} />
          <Text
            style={{
              marginTop: 10,
              color: colors.sub,
              fontFamily: 'Vazir-Regular',
            }}
          >
            در حال بارگذاری…
          </Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, padding: 16 }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: palette.warn,
                fontFamily: 'Vazir-Medium',
                textAlign: 'right',
                marginBottom: 8,
              }}
            >
              اشکال در دریافت برنامه
            </Text>
            <Text
              style={{
                color: colors.sub,
                fontFamily: 'Vazir-Regular',
                textAlign: 'right',
              }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={load}
              style={{
                marginTop: 12,
                backgroundColor: palette.primary,
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: '#fff', fontFamily: 'Vazir-Medium' }}
              >
                تلاش مجدد
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          stickyHeaderIndices={[0]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingBottom: 24,
            writingDirection: 'rtl',
          }}
        >
          {/* سکشن‌سوئیچر + تب روزها (فقط برای تمرین) */}
          <View
            style={{
              backgroundColor: colors.bg,
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderColor: colors.border,
              zIndex: 10,
              elevation: 2,
            }}
          >
            {/* سوئیچر تمرین / تغذیه */}
            <View
              style={{
                flexDirection: 'row-reverse',
                gap: 8,
                paddingHorizontal: 12,
                marginBottom: 6,
              }}
            >
              {[
                { k: 'workout', t: 'تمرین' },
                { k: 'nutrition', t: 'تغذیه' },
              ].map((s) => {
                const active = selectedSection === s.k;
                return (
                  <TouchableOpacity
                    key={s.k}
                    onPress={() => {
                      setSelectedSection(s.k);
                      setActiveDayIndex(0);
                    }}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active
                        ? palette.primary
                        : colors.border,
                      backgroundColor: active
                        ? '#2563eb22'
                        : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Vazir-Medium',
                        color: active
                          ? palette.primary
                          : colors.text,
                      }}
                    >
                      {s.t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* تب روزها فقط برای تمرین */}
            {selectedSection === 'workout' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 12,
                  flexDirection: 'row-reverse',
                }}
              >
                {days.map((d, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActiveDayIndex(idx)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: colors.border,
                      marginLeft: 8,
                      backgroundColor:
                        idx === activeDayIndex
                          ? '#2563eb22'
                          : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Vazir-Medium',
                        color:
                          idx === activeDayIndex
                            ? palette.primary
                            : colors.text,
                      }}
                    >
                      {d?.Title || `روز ${idx + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* محتوای اصلی */}
          <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
            {selectedSection === 'workout' ? (
              <WorkoutContent />
            ) : (
              <NutritionContent />
            )}
          </View>
        </ScrollView>
      )}

      {/* MODAL ویدئو */}
      <Modal
        visible={videoModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeVideo}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={closeVideo}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: SCREEN_WIDTH * 0.9,
              maxHeight: SCREEN_HEIGHT * 0.8,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 12,
            }}
          >
            <View
              style={{
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Vazir-Bold',
                  color: colors.text,
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {videoModal.title || 'نمایش حرکت'}
              </Text>
              <TouchableOpacity onPress={closeVideo}>
                <Text
                  style={{
                    fontFamily: 'Vazir-Bold',
                    color: colors.sub,
                    fontSize: 18,
                  }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: '100%',
                height: SCREEN_HEIGHT * 0.55,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#000',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {videoModal.url && isVideoMp4(videoModal.url) ? (
                <Video
                  source={{ uri: videoModal.url }}
                  style={{ width: '100%', height: '100%' }}
                  useNativeControls
                  resizeMode="contain"
                />
              ) : videoModal.url ? (
                <Image
                  source={{ uri: videoModal.url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
