type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type Toast = {
  id: string;
  title: string;
  variant: 'success' | 'error' | 'warning' | 'info';
};

interface State {
  toasts: Toast[];
}
