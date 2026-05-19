import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/router';
import { AppProviders } from './app/providers';
import { PageShell } from './components/layout/Shell';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <PageShell>
          <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading…</div>}>
            <AppRouter />
          </Suspense>
        </PageShell>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
