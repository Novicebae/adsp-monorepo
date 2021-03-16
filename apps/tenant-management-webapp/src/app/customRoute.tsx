import { Route, Redirect } from 'react-router-dom';
import React from 'react';
import { RootState } from './store';
import { useSelector } from 'react-redux';

export function PrivateRoute({ component: Component, ...rest }) {
  const homePath = '/';
  const { isAuthenticated } = useSelector((state: RootState) => ({
    isAuthenticated: state.session.authenticated,
  }));

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated === true ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: homePath, state: { from: props.location } }} />
        )
      }
    />
  );
}
