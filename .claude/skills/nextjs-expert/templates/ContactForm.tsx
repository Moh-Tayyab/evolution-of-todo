'use client';

import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';

interface FormState {
  message: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

interface SubmitButtonProps {
  children: React.ReactNode;
}

function SubmitButton({ children }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {pending ? 'Submitting...' : children}
    </button>
  );
}

export function ContactForm() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useFormState(
    async (prevState: FormState, formData: FormData) => {
      // This would be replaced with actual server action
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const message = formData.get('message') as string;

      // Basic validation
      if (!name || !email || !message) {
        return {
          message: 'Please fill in all fields',
          errors: {
            ...(name ? {} : { name: ['Name is required'] }),
            ...(email ? {} : { email: ['Email is required'] }),
            ...(message ? {} : { message: ['Message is required'] }),
          },
        };
      }

      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        message: 'Message sent successfully!',
        success: true,
      };
    },
    initialState
  );

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name" className="block mb-2 font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={state.success}
        />
        {state.errors?.name && (
          <p className="text-red-600 text-sm mt-1">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block mb-2 font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={state.success}
        />
        {state.errors?.email && (
          <p className="text-red-600 text-sm mt-1">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block mb-2 font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={state.success}
        />
        {state.errors?.message && (
          <p className="text-red-600 text-sm mt-1">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      <SubmitButton>Send Message</SubmitButton>

      {state.message && (
        <p className={`mt-4 ${state.success ? 'text-green-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
