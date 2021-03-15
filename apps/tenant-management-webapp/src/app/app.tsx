import React from 'react';
import './app.scss';
import '@abgov/react-components/react-components.esm.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import LandingPage from './components/landingPage';
import { TenantLogin, LoginSSO } from './components/login/';
import Logout from './components/logout/';
import CaseStudy from './components/caseStudy/';
import FileService from './components/file-service';
import ServiceMeasure from './components/serviceMeasure';
import AppStatus from './components/appStatus';
import Integration from './components/integration';
import SignUp from './components/signUp';
import Notifications from './components/notifications';
import TenantManagement from './components/tenantManagement';
import CreateRealm from './components/realms/CreateRealm';
import CreatingRealm from './components/realms/CreatingRealm';
import AddClientRole from './components/realms/AddClientRole';
import CreateErrorPage from './components/realms/CreateErrorPage';
import ActivateErrorPage from './components/realms/ActivateErrorPage';
import Realms from './components/realms/Realms';
import '@abgov/core-css/goa-core.css';
import BaseApp from './baseApp';
import { Provider } from 'react-redux';
import { store, persistor } from '../app/store';
import { PersistGate } from 'redux-persist/integration/react';
import { PrivateRoute } from './customRoute';

const AppRouters = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <LandingPage />
        </Route>
        <Route path="/:tenantName/login">
          <TenantLogin />
        </Route>
        <Route path="/login">
          <LoginSSO />
        </Route>
        <Route path="/logout">
          <Logout />
        </Route>
        <Route path="/sign-up">
          <SignUp />
        </Route>
        <BaseApp>
          <PrivateRoute path="/case-study" component={CaseStudy} />
          <PrivateRoute path="/file-service" component={FileService} />
          <PrivateRoute path="/service-measures" component={ServiceMeasure} />
          <PrivateRoute path="/app-status" component={AppStatus} />
          <PrivateRoute path="/notifications" component={Notifications} />
          <PrivateRoute path="/integration" component={Integration} />
          <PrivateRoute path="/tenant-admin" component={TenantManagement} />

          <Route path="/Realms" exact component={Realms} />
          <Route path="/Realms/CreateRealm" exact component={CreateRealm} />
          <Route path="/Realms/CreatingRealm" exact component={CreatingRealm} />
          <Route path="/Realms/AddClientRole" exact component={AddClientRole} />
          <Route path="/Realms/CreateErrorPage" exact component={CreateErrorPage} />
          <Route path="/Realms/ActivateErrorPage" exact component={ActivateErrorPage} />
        </BaseApp>
      </Switch>
    </Router>
  );
};

export const App = () => {
  return (
    <main>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppRouters />
        </PersistGate>
      </Provider>
    </main>
  );
};

export default App;
