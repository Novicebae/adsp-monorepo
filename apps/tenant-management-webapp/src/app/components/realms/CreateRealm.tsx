import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { GoAButton } from '@abgov/react-components';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import './SignIn.css';
const CreateRealm = () => {
  const [name, setName] = useState('');

  const history = useHistory();

  const onCreateRealm = async () => {
    const url = '/api/realm/v1?realm=' + name;
    const res = await axios.post(url);
    history.push('/realms/creatingRealm');
  };

  const backToMain = () => {
    history.push('/realms');
  };

  const onChangeName = (event) => {
    setName(event.target.value);
  };

  return (
    <Container className="signin-body mt-5">
      <Row>
        <Col
          lg={{ size: 6, offset: 3 }}
          md={{ size: 8, offset: 2 }}
          style={{
            padding: '51px',
            borderStyle: 'solid',
            borderColor: 'grey',
            borderWidth: '1px',
            boxShadow: '1px 2px #888888',
            margin: '0 8px 0 8px',
          }}
        >
          <div className="signin-title mb-5">
            <h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>
              Create tenant
            </h1>
          </div>
          <div className="mb-5">
            As a reminder, you are only able to create one tenant per user
            account
          </div>

          <label htmlFor="fname" className="siginin-small-title">
            Tenant Name
          </label>
          <input
            className="signin-input"
            value={name}
            onChange={onChangeName}
          />
          <div className="siginin-subset">
            Names cannot container special characters (ex. ! % &)
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ margin: '35px 11px 0 0' }}>
              <GoAButton onClick={backToMain} buttonType="secondary">
                Back
              </GoAButton>
            </div>
            <div style={{ margin: '35px 0 0 11px' }}>
              <GoAButton onClick={onCreateRealm}>Create Tenant</GoAButton>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateRealm;
