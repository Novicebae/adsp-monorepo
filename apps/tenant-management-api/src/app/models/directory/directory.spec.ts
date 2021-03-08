import { createDirectory }  from './directory';
import { createMockMongoServer, disconnect } from '../../../mongo';

describe('Directory Unit test', () => {
  beforeAll(async () => {
    await createMockMongoServer();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('can create new directory', async (done) => {
    const aDirectory =  {
      name: "ccds",
      services: [
        {
          service: "subsidy-application",
          host: "childcare-subsidy.alberta.ca"
        }
      ]
    }
  const response =   await createDirectory(aDirectory);
    expect(response).toEqual('201');
    done();
  });
});