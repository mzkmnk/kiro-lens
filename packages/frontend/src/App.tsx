import { Dashboard } from '@/components/Dashboard';

function App() {
  // プロジェクト名を取得（実際の実装では環境変数やAPIから取得）
  const projectName = 'kiro-lens-project';

  return <Dashboard projectName={projectName} />;
}

export default App;
