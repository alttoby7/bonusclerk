import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-4xl font-extrabold text-text-primary font-[var(--font-display)]">404</h1>
      <p className="mt-3 text-lg text-text-secondary">This page doesn&apos;t exist.</p>
      <div className="mt-6">
        <Button href="/">Back to Home</Button>
      </div>
    </Container>
  );
}
