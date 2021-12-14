// External
import { Routes, Router, Route, Navigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal
import GlobalStyles from 'components/GlobalStyles';
import ThemeController from 'components/ThemeController';
import { legacyMode } from 'consts/misc';
import { history } from 'lib/wallet';
import { showDefaultMenu } from 'lib/contextMenu';

import Overlays from './Overlays';
import Overview from './Overview';
import OverviewTritium from './OverviewTritium';
import Header from './Header';
import Navigation from './Navigation';
import Send from './Send';
import SendTritium from './SendTritium';
import Transactions from './Transactions';
import TransactionsTritium from './TransactionsTritium';
import AddressBook from './AddressBook';
import Settings from './Settings';
import Terminal from './Terminal';
import UserPage from './UserPage';
import Modules from './Modules';
import AppBackground from './AppBackground';

const AppLayout = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  height: '100%',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '74px auto 75px',
  gridTemplateAreas: '"header" "content" "navigation"',
});

const Main = styled.main({
  gridArea: 'content',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'stretch',
});

export default function App() {
  const theme = useSelector((state) => state.theme);
  return (
    <Router history={history}>
      <ThemeController theme={theme}>
        <GlobalStyles />
        <div onContextMenu={showDefaultMenu}>
          <Overlays>
            <AppBackground />
            <AppLayout>
              <Header />
              <Main>
                <Routes>
                  <Route
                    exact
                    path="/"
                    element={legacyMode ? <Overview /> : <OverviewTritium />}
                  />
                  <Route
                    exact
                    path="/Send"
                    element={legacyMode ? <Send /> : <SendTritium />}
                  />
                  <Route
                    exact
                    path="/Transactions"
                    element={
                      legacyMode ? <Transactions /> : <TransactionsTritium />
                    }
                  />
                  <Route exact path="/AddressBook" element={<AddressBook />} />
                  <Route path="/Settings" element={<Settings />} />
                  <Route path="/Terminal" element={<Terminal />} />
                  {!legacyMode && <Route path="/User" element={<UserPage />} />}
                  <Route path="/Modules/:name" element={<Modules />} />
                  <Route element={<Navigate to="/" replace />} />
                </Routes>
              </Main>
              <Navigation />
            </AppLayout>
          </Overlays>
        </div>
      </ThemeController>
    </Router>
  );
}
