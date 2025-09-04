import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="kiro-lens-ui-theme">
      <div className="container mx-auto p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-4">Kiro Lens</h1>
            <p className="text-muted-foreground mb-6">shadcn/ui統合テスト</p>
            <Badge variant="secondary">v1.0.0</Badge>
          </div>
          <ThemeToggle />
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>コンポーネントテスト</CardTitle>
            <CardDescription>
              shadcn/uiコンポーネントが正常に動作することを確認
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">テスト入力</Label>
              <Input id="test-input" placeholder="何か入力してください" />
            </div>
            <div className="flex gap-2">
              <Button>プライマリ</Button>
              <Button variant="secondary">セカンダリ</Button>
              <Button variant="outline">アウトライン</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  )
}

export default App;
