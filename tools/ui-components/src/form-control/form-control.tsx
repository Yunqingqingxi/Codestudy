import React, { useContext } from 'react';

import { FormContext } from '../form-context';
import { FormControlFeedback as Feedback } from './form-control-feedback';
import { FormControlStatic as Static } from './form-control-static';
import { FormControlProps, FormControlElement } from './types';

// Uses controlId from <FormGroup> if not explicitly specified.
// type Only relevant if componentClass is 'input'.

const FormControl = React.forwardRef<FormControlElement, FormControlProps>(
  (
    {
      className,
      id,
      testId,
      onChange,
      value,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      componentClass: Component = 'input',
      placeholder,
      name,
      required,
      type
    },
    ref
  ): JSX.Element => {
    const { controlId } = useContext(FormContext);

    let defaultClasses =
      'outline-0 block w-full py-1.5 px-2.5 text-md text-foreground-primary ' +
      'bg-background-primary bg-none rounded-none border-1 border-solid ' +
      'border-background-quaternary shadow-none ' +
      'transition ease-in-out duration-150 focus:border-foreground-tertiary';

    let variantClass;
    if (Component === 'textarea') variantClass = 'h-auto';
    else defaultClasses += 'h-8';

    //row and componentClass
    const classes = [defaultClasses, variantClass, className].join(' ');

    return (
      <Component
        ref={ref}
        id={id || controlId}
        data-testid={testId}
        className={classes}
        value={value}
        required={required}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    );
  }
);
const MainFormControl = Object.assign(FormControl, { Feedback, Static });

FormControl.displayName = 'FormControl';
export { MainFormControl as FormControl };
