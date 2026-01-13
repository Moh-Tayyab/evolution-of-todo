// Theme initialization script - runs before React hydration
// This avoids the flash of wrong theme

export function ThemeScript() {
	const script = `
    (function() {
      try {
        var mode = localStorage.getItem('theme');
        if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

	return (
		<script
			dangerouslySetInnerHTML={{ __html: script }}
			suppressHydrationWarning
		/>
	);
}
