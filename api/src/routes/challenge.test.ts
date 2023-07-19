/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { setupServer, superRequest } from '../../jest.utils';

const isValidChallengeCompletionErrorMsg = {
  type: 'error',
  message: 'That does not appear to be a valid challenge submission.'
};

// /project-completed
const id1 = 'bd7123c8c441eddfaeb5bdef';
const id2 = 'bd7123c8c441eddfaeb5bdec';

const codeallyProject = {
  id: id1,
  challengeType: 13,
  solution: 'https://any.valid/url'
};
const backendProject = {
  id: id2,
  challengeType: 4,
  solution: 'https://any.valid/url',
  githubLink: 'https://github.com/anything/valid/'
};

const partialCompletion = { id: id1, completedDate: 1 };

// /modern-challenge-completed
const HtmlChallengeId = '5dc174fcf86c76b9248c6eb2'; // HTML - 0
const JsProjectId = '56533eb9ac21ba0edf2244e2';
const multiFileCertProjectId = 'bd7158d8c242eddfaeb5bd13';

const HtmlChallengeBody = {
  challengeType: 0,
  id: HtmlChallengeId
};
const JsProjectBody = {
  challengeType: 5,
  id: JsProjectId,
  files: [
    {
      contents: 'console.log("Hello There!")',
      key: 'scriptjs',
      ext: 'js',
      name: 'script',
      history: ['script.js']
    }
  ]
};
const multiFileCertProjectBody = {
  challengeType: 14,
  id: multiFileCertProjectId,
  files: [
    {
      contents: '<h1>Multi File Project</h1>',
      key: 'indexhtml',
      ext: 'html',
      name: 'index',
      history: ['index.html']
    },
    {
      contents: '.hello-there { general: kenobi; }',
      key: 'stylescss',
      ext: 'css',
      name: 'styles',
      history: ['styles.css']
    }
  ]
};

describe('challengeRoutes', () => {
  setupServer();
  describe('Authenticated user', () => {
    let setCookies: string[];

    // Authenticate user
    beforeAll(async () => {
      const res = await superRequest('/auth/dev-callback', { method: 'GET' });
      expect(res.status).toBe(200);
      setCookies = res.get('Set-Cookie');
    });

    describe('/project-completed', () => {
      describe('validation', () => {
        it('POST rejects requests without ids', async () => {
          const response = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send({});

          expect(response.body).toStrictEqual(
            isValidChallengeCompletionErrorMsg
          );
          expect(response.statusCode).toBe(400);
        });

        it('POST rejects requests without valid ObjectIDs', async () => {
          const response = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
            // This is a departure from api-server, which does not require a
            // solution to give this error. However, the validator will reject
            // based on the missing solution before it gets to the invalid id.
          }).send({ id: 'not-a-valid-id', solution: '' });

          expect(response.body).toStrictEqual(
            isValidChallengeCompletionErrorMsg
          );
          expect(response.statusCode).toBe(400);
        });

        it('POST rejects requests with invalid challengeTypes', async () => {
          const response = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send({
            id: id1,
            challengeType: 'not-a-valid-challenge-type',
            // TODO(Post-MVP): drop these comments, since the api-server will not
            // exist.

            // a solution is required, because otherwise the request will be
            // rejected before it gets to the challengeType validation. NOTE: this
            // is a departure from the api-server, but only in the message sent.
            solution: ''
          });

          expect(response.body).toStrictEqual(
            isValidChallengeCompletionErrorMsg
          );
          expect(response.statusCode).toBe(400);
        });

        it('POST rejects requests without solutions', async () => {
          const response = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send({
            id: id1,
            challengeType: 3
          });

          expect(response.body).toStrictEqual({
            type: 'error',
            message:
              'You have not provided the valid links for us to inspect your work.'
          });
          expect(response.statusCode).toBe(400);
        });

        it('POST rejects requests with solutions that are not urls', async () => {
          const response = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send({
            id: id1,
            challengeType: 3,
            solution: 'not-a-valid-solution'
          });

          expect(response.body).toStrictEqual(
            isValidChallengeCompletionErrorMsg
          );
          expect(response.statusCode).toBe(400);
        });

        it('POST rejects CodeRoad/CodeAlly projects when the user has not completed the required challenges', async () => {
          const response = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send({
            id: id1, // not a codeally challenge id, but does not matter
            challengeType: 13, // this does matter, however, since there's special logic for that challenge type
            solution: 'https://any.valid/url'
          });

          expect(response.body).toStrictEqual({
            type: 'error',
            message:
              'You have to complete the project before you can submit a URL.'
          });
          // It's not really a bad request, since the client is sending a valid
          // body. It's just that the user is not allowed to do this - hence 403.
          expect(response.statusCode).toBe(403);
        });
      });

      describe('handling', () => {
        beforeEach(async () => {
          // setup: complete the challenges that codeally projects require
          await fastifyTestInstance.prisma.user.updateMany({
            where: { email: 'foo@bar.com' },
            data: {
              partiallyCompletedChallenges: [{ id: id1, completedDate: 1 }]
            }
          });
        });

        afterEach(async () => {
          await fastifyTestInstance.prisma.user.updateMany({
            where: { email: 'foo@bar.com' },
            data: {
              partiallyCompletedChallenges: [],
              completedChallenges: [],
              savedChallenges: [],
              progressTimestamps: []
            }
          });
        });

        it('POST accepts CodeRoad/CodeAlly projects when the user has completed the required challenges', async () => {
          const now = Date.now();
          const response = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send(codeallyProject);

          const user = await fastifyTestInstance.prisma.user.findFirst({
            where: { email: 'foo@bar.com' }
          });

          expect(user).toMatchObject({
            partiallyCompletedChallenges: [],
            completedChallenges: [
              {
                ...codeallyProject,
                completedDate: expect.any(Number)
              }
            ]
          });

          const completedDate = user?.completedChallenges[0]?.completedDate;

          // TODO: use a custom matcher for this
          expect(completedDate).toBeGreaterThan(now);
          expect(completedDate).toBeLessThan(now + 1000);

          expect(response.body).toStrictEqual({
            alreadyCompleted: false,
            points: 1,
            completedDate
          });

          expect(response.statusCode).toBe(200);
        });

        it('POST accepts backend projects', async () => {
          const now = Date.now();

          const response = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send(backendProject);

          const user = await fastifyTestInstance.prisma.user.findFirst({
            where: { email: 'foo@bar.com' }
          });

          expect(user).toMatchObject({
            partiallyCompletedChallenges: [partialCompletion],
            completedChallenges: [
              {
                ...backendProject,
                completedDate: expect.any(Number)
              }
            ]
          });

          const completedDate = user?.completedChallenges[0]?.completedDate;

          // TODO: use a custom matcher for this
          expect(completedDate).toBeGreaterThan(now);
          expect(completedDate).toBeLessThan(now + 1000);

          expect(response.body).toStrictEqual({
            alreadyCompleted: false,
            points: 1,
            completedDate
          });

          expect(response.statusCode).toBe(200);
        });

        it('POST correctly handles multiple requests', async () => {
          const resOriginal = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send(codeallyProject);

          const resBackend = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send(backendProject);

          // sending backendProject again should update its solution, but not
          // progressTimestamps or its completedDate

          const resUpdate = await superRequest('/project-completed', {
            method: 'POST',
            setCookies
          }).send({ ...codeallyProject, solution: 'https://any.other/url' });

          const user = await fastifyTestInstance.prisma.user.findFirst({
            where: { email: 'foo@bar.com' }
          });

          const expectedProgressTimestamps = user?.completedChallenges.map(
            challenge => challenge.completedDate
          );

          expect(user).toMatchObject({
            completedChallenges: [
              {
                ...codeallyProject,
                solution: 'https://any.other/url',
                completedDate: resOriginal.body.completedDate
              },
              {
                ...backendProject,
                completedDate: resBackend.body.completedDate
              }
            ],
            progressTimestamps: expectedProgressTimestamps
          });

          expect(resUpdate.body).toStrictEqual({
            alreadyCompleted: true,
            points: 2,
            completedDate: expect.any(Number)
          });

          // It should return an updated completedDate
          expect(resUpdate.body.completedDate).not.toBe(
            resOriginal.body.completedDate
          );
          expect(resUpdate.statusCode).toBe(200);
        });
      });
    });

    describe('/modern-challenge-completed', () => {
      describe('validation', () => {
        test('POST rejects requests without ids', async () => {
          const response = await superRequest('/modern-challenge-completed', {
            method: 'POST',
            setCookies
          });

          expect(response.statusCode).toBe(400);
          expect(response.body).toStrictEqual(
            isValidChallengeCompletionErrorMsg
          );
        });

        test('POST rejects requests without valid ObjectIDs', async () => {
          const response = await superRequest('/modern-challenge-completed', {
            method: 'POST',
            setCookies
          }).send({ id: 'not-a-valid-id' });

          expect(response.statusCode).toBe(400);
          expect(response.body).toStrictEqual(
            isValidChallengeCompletionErrorMsg
          );
        });
      });

      describe('handling', () => {
        describe('POST accepts the following challenges', () => {
          afterEach(async () => {
            await fastifyTestInstance.prisma.user.updateMany({
              where: { email: 'foo@bar.com' },
              data: {
                completedChallenges: [],
                savedChallenges: [],
                progressTimestamps: []
              }
            });
          });

          // HTML(0), JS(1), Modern(6), Video(11), The Odin Project(15)
          test('HTML Challenge - 0', async () => {
            const now = Date.now();

            const response = await superRequest('/modern-challenge-completed', {
              method: 'POST',
              setCookies
            }).send(HtmlChallengeBody);

            const user = await fastifyTestInstance.prisma.user.findFirst({
              where: { email: 'foo@bar.com' }
            });

            expect(user).toMatchObject({
              completedChallenges: [
                {
                  id: HtmlChallengeId,
                  completedDate: expect.any(Number)
                }
              ]
            });

            const completedDate = user?.completedChallenges[0]?.completedDate;
            expect(completedDate).toBeGreaterThanOrEqual(now);
            expect(completedDate).toBeLessThanOrEqual(now + 1000);

            expect(response.statusCode).toBe(200);
            expect(response.body).toStrictEqual({
              alreadyCompleted: false,
              points: 1,
              completedDate,
              savedChallenges: []
            });
          });

          // JS Project(5), Multi-file Cert Project(14)
          test('JS Project - 5', async () => {
            const now = Date.now();

            const response = await superRequest('/modern-challenge-completed', {
              method: 'POST',
              setCookies
            }).send(JsProjectBody);

            const user = await fastifyTestInstance.prisma.user.findFirst({
              where: { email: 'foo@bar.com' }
            });

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { history: _history, ...files } = JsProjectBody.files[0]!;

            expect(user).toMatchObject({
              completedChallenges: [
                {
                  id: JsProjectId,
                  challengeType: JsProjectBody.challengeType,
                  files: [files],
                  completedDate: expect.any(Number)
                }
              ]
            });

            const completedDate = user?.completedChallenges[0]?.completedDate;
            expect(completedDate).toBeGreaterThanOrEqual(now);
            expect(completedDate).toBeLessThanOrEqual(now + 1000);

            expect(response.statusCode).toBe(200);
            expect(response.body).toStrictEqual({
              alreadyCompleted: false,
              points: 1,
              completedDate,
              savedChallenges: []
            });
          });

          test('Multi-file Cert Project - 14', async () => {
            const now = Date.now();

            const response = await superRequest('/modern-challenge-completed', {
              method: 'POST',
              setCookies
            }).send(multiFileCertProjectBody);

            const user = await fastifyTestInstance.prisma.user.findFirst({
              where: { email: 'foo@bar.com' }
            });

            const testFiles = multiFileCertProjectBody.files.map(
              ({ history: _history, ...rest }) => rest
            );

            console.log(user?.savedChallenges);

            expect(user).toMatchObject({
              needsModeration: true,
              completedChallenges: [
                {
                  id: multiFileCertProjectId,
                  challengeType: multiFileCertProjectBody.challengeType,
                  files: testFiles,
                  completedDate: expect.any(Number),
                  isManuallyApproved: true
                }
              ],
              savedChallenges: [
                {
                  id: multiFileCertProjectId,
                  lastSavedDate: expect.any(Number),
                  files: multiFileCertProjectBody.files
                }
              ]
            });

            const completedDate = user?.completedChallenges[0]?.completedDate;
            expect(completedDate).toBeGreaterThanOrEqual(now);
            expect(completedDate).toBeLessThanOrEqual(now + 1000);

            expect(response.statusCode).toBe(200);
            expect(response.body).toStrictEqual({
              alreadyCompleted: false,
              points: 1,
              completedDate,
              savedChallenges: [
                {
                  id: multiFileCertProjectId,
                  lastSavedDate: completedDate,
                  files: multiFileCertProjectBody.files
                }
              ]
            });
          });
        });
      });
    });
  });

  describe('Unauthenticated user', () => {
    let setCookies: string[];

    // Get the CSRF cookies from an unprotected route
    beforeAll(async () => {
      const res = await superRequest('/', { method: 'GET' });
      setCookies = res.get('Set-Cookie');
    });

    describe('/project-completed', () => {
      test('POST returns 401 status code with error message', async () => {
        const response = await superRequest('/project-completed', {
          method: 'POST',
          setCookies
        });

        expect(response?.statusCode).toBe(401);
      });
    });

    test('POST /modern-challenge-completed returns 401 status code with error message', async () => {
      const response = await superRequest('/modern-challenge-completed', {
        method: 'POST',
        setCookies
      });

      expect(response?.statusCode).toBe(401);
    });
  });
});
