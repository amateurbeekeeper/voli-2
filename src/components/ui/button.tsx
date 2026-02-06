import * as React from 'react';
import styled from 'styled-components';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const StyledButton = styled.button<{ $variant: ButtonVariant; $size: ButtonSize }>`
  font-family: var(--font-stack);
  font-weight: var(--font-weight-normal);
  line-height: var(--text-line-height);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-s);
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  border-radius: var(--border-radius-m);

  &:focus-visible {
    outline: 2px solid var(--palette-outline-default);
    outline-offset: 2px;
  }
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  /* Size */
  ${({ $size }) =>
    $size === 'default' &&
    `
    height: 36px;
    padding: 0 var(--spacing-l);
    font-size: var(--text-size-medium);
  `}
  ${({ $size }) =>
    $size === 'sm' &&
    `
    height: 32px;
    padding: 0 var(--spacing-m);
    font-size: var(--text-size-small);
    border-radius: var(--border-radius-s);
  `}
  ${({ $size }) =>
    $size === 'lg' &&
    `
    height: 40px;
    padding: 0 var(--spacing-xl);
    font-size: var(--text-size-medium);
  `}
  ${({ $size }) =>
    $size === 'icon' &&
    `
    height: 36px;
    width: 36px;
    padding: 0;
  `}

  /* Variant */
  ${({ $variant }) =>
    $variant === 'default' &&
    `
    background-color: var(--palette-highlight-primary-normal-background);
    color: var(--palette-highlight-primary-normal-foreground);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    &:hover:not(:disabled) {
      background-color: var(--palette-highlight-primary-hover-background);
    }
  `}
  ${({ $variant }) =>
    $variant === 'destructive' &&
    `
    background-color: var(--palette-destructive-normal-background);
    color: var(--palette-destructive-normal-foreground);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    &:hover:not(:disabled) {
      background-color: var(--palette-destructive-hover-background);
    }
  `}
  ${({ $variant }) =>
    $variant === 'outline' &&
    `
    background-color: var(--palette-background-default);
    color: var(--palette-foreground-default);
    border: 1px solid var(--palette-outline-default);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    &:hover:not(:disabled) {
      background-color: var(--palette-highlight-secondary-normal-background);
      color: var(--palette-highlight-secondary-normal-foreground);
    }
  `}
  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background-color: var(--palette-highlight-secondary-normal-background);
    color: var(--palette-highlight-secondary-normal-foreground);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    &:hover:not(:disabled) {
      background-color: var(--palette-highlight-secondary-hover-background);
    }
  `}
  ${({ $variant }) =>
    $variant === 'ghost' &&
    `
    background-color: transparent;
    color: var(--palette-foreground-default);
    &:hover:not(:disabled) {
      background-color: var(--palette-highlight-secondary-normal-background);
      color: var(--palette-highlight-secondary-normal-foreground);
    }
  `}
  ${({ $variant }) =>
    $variant === 'link' &&
    `
    background-color: transparent;
    color: var(--palette-highlight-primary-normal-background);
    text-decoration: underline;
    text-underline-offset: 4px;
    &:hover:not(:disabled) {
      text-decoration: underline;
    }
  `}
`;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', type = 'button', ...props }, ref) => (
    <StyledButton ref={ref} type={type} $variant={variant} $size={size} {...props} />
  )
);
Button.displayName = 'Button';

export { Button };
