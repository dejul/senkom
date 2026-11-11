import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return (
    <main>
      <header>
        SENKOM <span>ADMIN / PHASE 0</span>
      </header>
      <p className="eyebrow">FONDASI PENGELOLAAN INFRASTRUKTUR</p>
      <h1>
        Satu sumber data.
        <br />
        Publikasi terkendali.
      </h1>
      <p>
        Web Admin disiapkan terpisah dari desktop viewer. Login, pengelolaan
        aset, dan publikasi peta tersedia pada Phase 2.
      </p>
      <aside>
        <strong>DEMO / BELUM OPERASIONAL</strong>
        <p>
          Belum terhubung ke API atau database. Tidak ada data infrastruktur
          aktual pada halaman ini.
        </p>
      </aside>
      <footer>Kontrak API v1 / Snapshot schemaVersion 1</footer>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
