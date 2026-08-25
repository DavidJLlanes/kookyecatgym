import React from 'react';
import { Exercise } from '../types';
import { useLightbox } from '../context/LightboxContext';
import { getStaticThumbUrl } from '../utils/media';
import { detectMuscleZone, MUSCLE_ZONE_IMAGE, MUSCLE_ZONE_LABEL } from '../utils/muscleZone';

interface ExerciseCardThumbnailProps {
  exercise: Exercise;
  mode: 'photo' | 'anatomy';
}

export default function ExerciseCardThumbnail({ exercise, mode }: ExerciseCardThumbnailProps) {
  const { openLightbox } = useLightbox();
  const hasValidPhoto =
    !!exercise.imageUrl &&
    !exercise.imageUrl.includes('placeholder') &&
    (exercise.imageUrl.startsWith('http') || exercise.imageUrl.startsWith('/'));

  if (mode === 'photo' && hasValidPhoto) {
    return (
      <img
        src={getStaticThumbUrl(exercise.imageUrl)}
        alt={exercise.name}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onClick={(e) => {
          e.stopPropagation();
          openLightbox(exercise.imageUrl, exercise.name);
        }}
        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
      />
    );
  }

  const zone = detectMuscleZone(exercise);

  return (
    <img
      src={MUSCLE_ZONE_IMAGE[zone]}
      alt={MUSCLE_ZONE_LABEL[zone]}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
    />
  );
}
