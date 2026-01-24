export function useToast() {
  return {
    toast: (options: { title: string; description?: string; variant?: string }) => {
      // Здесь твоя логика показа тоста (например, alert или вызов библиотеки)
      alert(`${options.title}\n${options.description ?? ""}`);
    }
  };
}

export const toast = { /* ... */ };