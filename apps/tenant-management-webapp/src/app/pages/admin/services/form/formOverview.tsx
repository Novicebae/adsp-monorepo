import React, { useEffect } from 'react';
import { OverviewLayout } from '@components/Overview';
import { GoAButton } from '@abgov/react-components-new';
import { useRouteMatch } from 'react-router';
import { useHistory } from 'react-router-dom';

const FormOverview = (): JSX.Element => {
  const { url } = useRouteMatch();

  useEffect(() => {
    history.push({
      pathname: '/admin/services/form',
    });
  }, []);

  const history = useHistory();

  return (
    <OverviewLayout
      description={
        <section>
          <p>
            The form service provides capabilities to support user form submission. Form definitions are used to
            describe types of form with roles for applicants, clerks who assist them, and assessors who process the
            submissions.
          </p>
          <p>
            Information is stored in a form model so that applicants can save and resume a draft, and then submit when
            ready.
          </p>
        </section>
      }
      addButton={
        <>
          <GoAButton
            testId="add-definition"
            onClick={() => {
              history.push(`${url}/new?definitions=true`);
            }}
          >
            Add definition
          </GoAButton>
        </>
      }
    />
  );
};
export default FormOverview;
