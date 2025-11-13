// src/services/offlinePlanService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const PLAN_KEY = (planId) => `plan:${planId}`;
const VIDEO_MAP_KEY = (planId) => `planVideos:${planId}`;

// ذخیره‌کردن برنامه (فقط داده خام API، مپ نهایی رو ActivePlan خودش انجام می‌دهد)
export async function cachePlan(planId, workoutData, nutritionData) {
  try {
    const payload = {
      workout: workoutData || null,
      nutrition: nutritionData || null,
      cachedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PLAN_KEY(planId), JSON.stringify(payload));
  } catch (err) {
    console.warn('cachePlan error', err);
  }
}

// خواندن برنامه از کش
export async function loadCachedPlan(planId) {
  try {
    const raw = await AsyncStorage.getItem(PLAN_KEY(planId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('loadCachedPlan error', err);
    return null;
  }
}

// دانلود و ذخیرهٔ ویدئوها (یا GIFها) برای یک برنامه
export async function ensureVideosDownloaded(planId, workoutData) {
  try {
    if (!workoutData) return;

    // همهٔ حرکات را جمع کن
    const allExercises = [];
    (workoutData?.WorkoutDetails || []).forEach((day) => {
      (day?.WorkoutGroups || []).forEach((g) => {
        (g?.ExerciseRecords || []).forEach((ex) => {
          if (ex?.VideoUrl && ex?.ExerciseId) {
            allExercises.push(ex);
          }
        });
      });
    });

    if (!allExercises.length) return;

    // مپ قبلی را بخوان
    const existingRaw = await AsyncStorage.getItem(VIDEO_MAP_KEY(planId));
    const videoMap = existingRaw ? JSON.parse(existingRaw) : {};

    for (const ex of allExercises) {
      const { ExerciseId, VideoUrl } = ex;
      if (!ExerciseId || !VideoUrl) continue;

      // اگر قبلاً دانلود شده، رد شو
      if (videoMap[ExerciseId]) continue;

      const extMatch = VideoUrl.split('.').pop().toLowerCase();
      const ext = extMatch.includes('?') ? extMatch.split('?')[0] : extMatch;
      const fileName = `${ExerciseId}.${ext || 'mp4'}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const info = await FileSystem.getInfoAsync(fileUri);
      if (!info.exists) {
        // دانلود
        await FileSystem.downloadAsync(VideoUrl, fileUri);
      }

      videoMap[ExerciseId] = fileUri;
    }

    await AsyncStorage.setItem(VIDEO_MAP_KEY(planId), JSON.stringify(videoMap));
  } catch (err) {
    console.warn('ensureVideosDownloaded error', err);
  }
}

// گرفتن آدرس ویدئوی لوکال (اگر بود) یا ریموت
export async function getExerciseVideoUri(planId, exercise) {
  const videoUrl = exercise?.VideoUrl;
  const exerciseId = exercise?.ExerciseId;
  if (!exerciseId || !videoUrl) return null;

  try {
    const raw = await AsyncStorage.getItem(VIDEO_MAP_KEY(planId));
    const map = raw ? JSON.parse(raw) : {};
    if (map[exerciseId]) {
      return map[exerciseId]; // آدرس فایل لوکال
    }
  } catch {}

  // اگر فایل لوکال نبود، همون ریموت رو برگردون
  return videoUrl;
}
