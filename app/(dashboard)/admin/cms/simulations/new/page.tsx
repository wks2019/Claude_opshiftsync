import { CreateSimulationForm } from '@/components/create-simulation-form'

export default function NewSimulationPage() {
  return (
    <section className="max-w-md">
      <p className="eyebrow mb-2">New simulation</p>
      <h1 className="display mb-10 text-2xl text-ink">Start a scenario</h1>
      <CreateSimulationForm />
    </section>
  )
}
