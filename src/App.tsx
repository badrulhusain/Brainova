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
          <Suspense
            fallback={
              <div className="flex min-h-[80vh] items-center justify-center px-4 text-sm font-medium text-muted">
                Loading
              </div>
            }
          >
            <AppRouter />
          </Suspense>
        </PageShell>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
