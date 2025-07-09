import { useTranslatedText } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  text: string;
  className?: string;
  fallback?: string;
}

export function TranslatedText({ text, className, fallback }: TranslatedTextProps) {
  const { translatedText, isLoading } = useTranslatedText(text);

  if (isLoading) {
    return <span className={className}>{fallback || text}</span>;
  }

  return <span className={className}>{translatedText}</span>;
}