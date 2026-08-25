import React, { useEffect, useState } from 'react';
import { formatEsNumber, parseEsNumber } from '../utils/number';

interface DecimalInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
}

// Input de texto para pesos (kg) que acepta la coma como separador decimal
// (formato español), en lugar de <input type="number"> cuyo teclado numérico
// y validación dependen del locale del navegador y suelen rechazar la coma.
// El texto se muestra tal cual mientras el usuario escribe, y solo se
// reformatea (p. ej. "7," -> "7") al perder el foco.
export default function DecimalInput({ id, value, onChange, placeholder, className, min = 0 }: DecimalInputProps) {
  const [text, setText] = useState(() => (value ? formatEsNumber(value) : ''));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(value ? formatEsNumber(value) : '');
    }
  }, [value, focused]);

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={text}
      onFocus={() => {
        setFocused(true);
        // Al entrar en edición se quita el punto de millar: el valor mostrado
        // en reposo puede venir agrupado (ej. "1.234,5"), pero el regex de
        // edición de abajo solo admite UN separador decimal — si se dejara el
        // punto de millar, cualquier valor >= 1000 quedaría bloqueado para
        // editar en cuanto el usuario tocara una tecla.
        setText(value ? formatEsNumber(value).replace(/\./g, '') : '');
      }}
      onChange={(e) => {
        const raw = e.target.value;
        if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return; // solo dígitos y un separador decimal
        setText(raw);
        onChange(Math.max(min, parseEsNumber(raw)));
      }}
      onBlur={() => {
        setFocused(false);
        setText(value ? formatEsNumber(value) : '');
      }}
      className={className}
    />
  );
}
