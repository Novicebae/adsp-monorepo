import React from 'react';
import styled from 'styled-components';
import GoaLogo from '@assets/goa-logo.svg';

interface FooterProps {
  logoSrc?: string;
}
function Footer({ logoSrc }: FooterProps): JSX.Element {
  return (
    <FooterContainer>
      <LinksLogoContainer>
        <FooterLinks>
          <a href="https://www.alberta.ca">Feedback</a>
          <a href="https://www.alberta.ca/disclaimer.aspx">FQAs</a>
          <a href="https://www.alberta.ca/privacystatement.aspx">Help</a>
          <a href="https://www.alberta.ca/accessibility.aspx">Terms of use</a>
        </FooterLinks>
        <img src={logoSrc ?? GoaLogo} alt="Government of alberta logo" />
      </LinksLogoContainer>
      <FooterCopyright>© {new Date().getFullYear()} Government of Alberta</FooterCopyright>
    </FooterContainer>
  );
}

export default Footer;
const FooterCopyright = styled.div`
  text-align: right;
  padding: 1rem;
`;
const FooterContainer = styled.footer`
  background-color: var(--color-gray-100);
  padding-top: 2rem;
  padding-bottom: 2rem;
  padding-right: 10rem;
  padding-left: 10rem;
  border-bottom: 16px solid #0081a2;
`;
const LinksLogoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-gray-200);
  padding-bottom: 1rem;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 90%;
  justify-content: center;
  > * {
    margin-right: 1rem;
  }
  a:link {
    color: var(--black-100);
  }
  a:visited {
    color: var(--color-link-visited);
  }
`;
