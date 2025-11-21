export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Setting: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}