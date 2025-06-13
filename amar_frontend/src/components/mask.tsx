import type React from 'react';
import { forwardRef } from 'react';
import { IMaskInput, type IMaskInputProps } from 'react-imask';

import type { Mask } from 'imaskjs';

interface MaskedInputFieldProps extends Omit<IMaskInputProps<any>, 'onAccept'> {
  mask: Mask<any>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const MaskedInputField = forwardRef<typeof IMaskInput, MaskedInputFieldProps>(
  ({ mask, onChange, ...props }, ref) => {
    function handleAccept(value: string) {
      if (onChange) {
        onChange({
          target: { name: props.name, value },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }

    return (
      <IMaskInput
        {...props}
        mask={mask}
        ref={ref}
        className="w-full bg-transparent outline-none flex-1 outline-0 text-pink400"
        onAccept={handleAccept}
      />
    );
  }
);
