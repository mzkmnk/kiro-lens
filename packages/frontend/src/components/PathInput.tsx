import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen } from 'lucide-react';
import { projectApiService } from '@/services';

interface PathInputProps {
  /** パス確定時のコールバック */
  onPathConfirm: (path: string) => void;
  /** 初期パス値 */
  initialPath?: string;
  /** プレースホルダーテキスト */
  placeholder?: string;
}

interface ValidationState {
  /** バリデーション結果 */
  isValid: boolean;
  /** エラーメッセージ */
  message?: string;
  /** バリデーション中フラグ */
  isValidating: boolean;
}

/**
 * PathInputコンポーネント
 *
 * プロジェクトパスの入力とリアルタイムバリデーション機能を提供
 * .kiroディレクトリの存在確認とパス補完機能を含む
 */
export const PathInput: React.FC<PathInputProps> = ({
  onPathConfirm,
  initialPath = '',
  placeholder = 'プロジェクトのパスを入力してください（例: /Users/username/my-project）',
}) => {
  const [path, setPath] = useState(initialPath);
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    isValidating: false,
  });

  // パスのバリデーション
  const validatePathInput = useCallback(async (inputPath: string) => {
    if (!inputPath.trim()) {
      setValidation({
        isValid: false,
        message: undefined,
        isValidating: false,
      });
      return;
    }

    setValidation(prev => ({ ...prev, isValidating: true }));

    try {
      const result = await projectApiService.validatePath(inputPath.trim());
      setValidation({
        isValid: result.isValid,
        message: result.error || (result.isValid ? 'パスが有効です' : undefined),
        isValidating: false,
      });
    } catch (error) {
      setValidation({
        isValid: false,
        message: error instanceof Error ? error.message : 'パスの検証に失敗しました',
        isValidating: false,
      });
    }
  }, []);

  // パス入力時の処理（デバウンス付き）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validatePathInput(path);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [path, validatePathInput]);

  // パス確定処理
  const handleConfirm = () => {
    if (validation.isValid && path.trim()) {
      onPathConfirm(path.trim());
    }
  };

  // Enterキー押下時の処理
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && validation.isValid) {
      handleConfirm();
    }
  };

  return (
    <div className='w-full max-w-2xl mx-auto space-y-4'>
      <Input
        id='project-path'
        type='text'
        value={path}
        onChange={e => setPath(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          pr-10 
          ${validation.isValid ? 'border-green-500 focus:border-green-500' : ''}
          ${validation.message && !validation.isValid ? 'border-red-500 focus:border-red-500' : ''}
        `}
        aria-describedby='path-validation-message'
      />

      <Button
        onClick={handleConfirm}
        disabled={!validation.isValid || validation.isValidating}
        className='bg-[#4a4459] hover:bg-[#4a4459]/90 text-white w-full'
      >
        <FolderOpen className='h-4 w-4 mr-2' />
        プロジェクトを追加
      </Button>
    </div>
  );
};
