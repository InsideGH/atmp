export const stanMock = <any>{
  publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
    callback();
  }),
};
