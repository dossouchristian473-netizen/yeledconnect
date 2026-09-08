import { SubpageHeader } from "@/components/SubpageHeader";

export default function MessagesPage() {
  return (
    <div>
      <SubpageHeader title="Messages" />
      <div className="flex flex-col items-center text-center px-8 pt-12">
        <div className="w-[150px] h-[120px] mb-6" aria-hidden />
        <h2 className="text-[22px] font-semibold mb-3">Messagerie interne</h2>
        <p className="text-soft text-[14.5px] leading-relaxed max-w-[340px]">
          Bientôt : échangez directement avec les responsables de vos enfants.
        </p>
      </div>
    </div>
  );
}
