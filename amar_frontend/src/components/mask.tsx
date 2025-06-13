import type React from 'react';
import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';

interface MaskedInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string;
}

export const MaskedInputField = forwardRef<HTMLInputElement, MaskedInputFieldProps>
(
  ({ mask, onChange, ...props }, ref) => {
    // Função para "adaptar" o onAccept do IMask para o onChange do React
    function handleAccept(value: string) {
      if (onChange) {
        // Cria um evento sintético similar ao onChange normal do React
        onChange({
          target: { name: props.name, value },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }

    return (
      <IMaskInput
        {...props}
        mask={mask}
        inputRef={ref}
        className="w-full bg-transparent outline-none flex-1 outline-0 text-pink400"
        onAccept={handleAccept}
      />
    )
  }
);
