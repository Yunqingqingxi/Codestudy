import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import type { PortfolioProjectData } from '../../../redux/prop-types';
import './portfolio-projects.css';
import { FullWidthRow } from '../../helpers';

interface PortfolioProjectsProps {
  portfolioProjects: PortfolioProjectData[];
}

export const PortfolioProjects = ({
  portfolioProjects
}: PortfolioProjectsProps): JSX.Element | null => {
  const { t } = useTranslation();
  if (!portfolioProjects.length) {
    return null;
  }
  return (
    <FullWidthRow>
      <h2>{t('profile.projects')}</h2>
      {portfolioProjects.map(({ title, url, image, description, id }) => (
        <div className='portfolio-card' key={id}>
          {image && (
            <img
              alt=''
              className='portfolio-image'
              src={image}
              onError={({ currentTarget }) => {
                currentTarget.src =
                  'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png';
              }}
            />
          )}
          <div className='portfolio-card-description'>
            <div className='portfolio-card-text'>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <div className='portfolio-button-container'>
              <a
                href={url}
                rel='nofollow noopener noreferrer'
                target='_blank'
                className='portfolio-card-button'
              >
                {t('buttons.view')}
                <span className='sr-only'>
                  {title}, {t('aria.opens-new-window')}
                </span>
                <FontAwesomeIcon
                  id='link-icon'
                  icon={faArrowUpRightFromSquare}
                />
              </a>
            </div>
          </div>
        </div>
      ))}
      <hr />
    </FullWidthRow>
  );
};
