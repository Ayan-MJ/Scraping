import React from 'react';
import { Button } from '@/components/ui/button';
import { useCreateRun } from '@/hooks/useRuns';
import { Loader2 } from 'lucide-react';

interface RunButtonProps {
  projectId: number;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onSuccess?: (runId: number) => void;
  config?: Record<string, any>;
  urls?: string[];
  url?: string;
}

export function RunButton({
  projectId,
  className,
  variant = 'default',
  size = 'default',
  onSuccess,
  config,
  urls,
  url,
}: RunButtonProps) {
  const { mutate, isPending } = useCreateRun();

  const handleClick = () => {
    mutate({
      projectId,
      config,
      urls,
      url,
    }, {
      onSuccess: (data) => {
        onSuccess?.(data.id);
      },
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={variant}
      size={size}
      className={className}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Run Now
    </Button>
  );
} 