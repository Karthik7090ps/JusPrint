import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainTabs: undefined;
  DocumentUpload: undefined;
  PrinterSelection: undefined;
  PaymentScreen: { orderId: string } | undefined;
  JobStatus: { jobId: string };
  RequirementForm: undefined;
  PCBOrder: undefined;
  Print3D: undefined;
  ComponentsStore: undefined;
  ProductDetails: { productId: string };
  Settings: undefined;
};

export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

