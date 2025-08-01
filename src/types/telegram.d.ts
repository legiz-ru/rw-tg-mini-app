declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        isClosingConfirmationEnabled: boolean;
        headerColor: string;
        backgroundColor: string;
        BackButton: any;
        MainButton: any;
        SettingsButton: any;
        HapticFeedback: any;
        CloudStorage: any;
        BiometricManager: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showPopup: (params: any, callback?: (buttonId: string) => void) => void;
        showScanQrPopup: (params: any, callback?: (text: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (text: string) => void) => void;
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;
        requestContact: (callback?: (granted: boolean, contact?: any) => void) => void;
        invokeCustomMethod: (method: string, params: any, callback?: (error: Error | null, result?: any) => void) => void;
        switchInlineQuery: (query: string, chooseChatTypes?: string[]) => void;
        openLink: (url: string, options?: any) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
      };
    };
  }
}

export {};