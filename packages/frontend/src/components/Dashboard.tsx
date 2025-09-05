import React from 'react';
import App from '../App';

interface DashboardProps {
  projectName: string;
}

/**
 * Dashboardコンポーネント
 *
 * Kiro IDEの.kiro配下ファイル管理ツールのメインダッシュボード
 * App.tsxコンポーネントのラッパーとして機能し、プロジェクト名を渡す
 *
 * @param projectName - 現在のプロジェクト名
 */
export const Dashboard: React.FC<DashboardProps> = ({ projectName }) => {
  return (
    <div data-testid='dashboard-container'>
      <App projectName={projectName} />
    </div>
  );
};
