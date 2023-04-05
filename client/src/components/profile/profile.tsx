import { Grid, Row } from '@freecodecamp/react-bootstrap';
import React from 'react';
import Helmet from 'react-helmet';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { FullWidthRow, Link, Spacer } from '../helpers';
import { User } from './../../redux/prop-types';
import Timeline from './components/time-line';
import Camper from './components/camper';
import Certifications from './components/certifications';
import HeatMap from './components/heat-map';
import { PortfolioProjects } from './components/portfolio-projects';

interface ProfileProps {
  isSessionUser: boolean;
  user: User;
}

function Message({ t }: { t: TFunction }): JSX.Element {
  return (
    <FullWidthRow>
      <h2 className='text-center'>{t('profile.you-not-public')}</h2>
      <p className='alert alert-info'>{t('profile.you-change-privacy')}</p>
      <Spacer size='medium' />
    </FullWidthRow>
  );
}

function UserProfile({ user }: { user: ProfileProps['user'] }): JSX.Element {
  const {
    profileUI: {
      showAbout,
      showCerts,
      showDonation,
      showHeatMap,
      showLocation,
      showName,
      showPoints,
      showPortfolio,
      showTimeLine
    },
    calendar,
    completedChallenges,
    githubProfile,
    linkedin,
    twitter,
    website,
    name,
    username,
    joinDate,
    location,
    points,
    picture,
    portfolio,
    about,
    yearsTopContributor,
    isDonating
  } = user;
  return (
    <>
      <Camper
        about={showAbout ? about : ''}
        githubProfile={githubProfile}
        isDonating={showDonation ? isDonating : false}
        joinDate={showAbout ? joinDate : ''}
        linkedin={linkedin}
        location={showLocation ? location : ''}
        name={showName ? name : ''}
        picture={picture}
        points={showPoints ? points : null}
        twitter={twitter}
        username={username}
        website={website}
        yearsTopContributor={yearsTopContributor}
      />
      {showHeatMap ? <HeatMap calendar={calendar} /> : null}
      {showCerts ? <Certifications username={username} /> : null}
      {showPortfolio ? (
        <PortfolioProjects portfolioProjects={portfolio} />
      ) : null}
      {showTimeLine ? (
        <Timeline completedMap={completedChallenges} username={username} />
      ) : null}
      <Spacer size='medium' />
    </>
  );
}

function Profile({ user, isSessionUser }: ProfileProps): JSX.Element {
  const { t } = useTranslation();
  const {
    profileUI: { isLocked },
    username
  } = user;

  const isPublicProfile = !isLocked || isSessionUser;

  return (
    <>
      <Helmet>
        <title>{t('buttons.profile')} | freeCodeCamp.org</title>
      </Helmet>
      <Spacer size='medium' />
      <Grid>
        <Spacer size='medium' />
        {isLocked && <Message t={t} />}
        {isPublicProfile && <UserProfile user={user} />}
        {!isSessionUser && (
          <Row className='text-center'>
            <Link to={`/user/${username}/report-user`}>
              {t('buttons.flag-user')}
            </Link>
          </Row>
        )}
        <Spacer size='medium' />
      </Grid>
    </>
  );
}

Profile.displayName = 'Profile';

export default Profile;
