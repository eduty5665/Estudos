import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle, XCircle, ChevronDown, ChevronRight, AlertTriangle, Trophy, Target, Phone, MessageSquare, FileText, Star } from "lucide-react";

// CDN URLs for images
const IMAGES = {
  rdLogo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663421381815/Z6rK4LrCNjQcFbpDwSQZKf/rd_logo_6d5ffe35.jpg",
  crmInterface: "https://d2xsxph8kpxj0f.cloudfront.net/310519663421381815/Z6rK4LrCNjQcFbpDwSQZKf/rd_crm_interface_595979cc.png",
  rdFunil: "https://d2xsxph8kpxj0f.cloudfront.net/310519663421381815/Z6rK4LrCNjQcFbpDwSQZKf/rd_funil_22c201c2.png",
  funilEtapas: "https://d2xsxph8kpxj0f.cloudfront.net/310519663421381815/Z6rK4LrCNjQcFbpDwSQZKf/funil_etapas_b304aaeb.png",
};

// Funnel stages data
const FUNNEL_STAGES = [
  {
    id: 1,
    number: "01",
    title: "Prospecção / Contato Inicial",
    subtitle: "Porta de Entrada",
    color: "#0D9488",
    icon: <Phone className="w-6 h-6" />,
    description: "Identificação e primeiro contato com o potencial cliente. Aqui ficam todos os leads que ainda serão ou acabaram de ser abordados.",
    actions: [
      "Criar a negociação no CRM com os dados do contato",
      "Registrar a origem do lead (indicação, site, evento)",
      "Agendar o primeiro contato ou registrar a tentativa",
      "Anotar informações relevantes sobre o potencial cliente",
    ],
    tip: "Regra das 3 tentativas: sem resposta após 3 contatos em dias e horários diferentes, avalie encerrar a negociação.",
    tipType: "warning",
  },
  {
    id: 2,
    number: "02",
    title: "Contato Realizado / Levantamento",
    subtitle: "Entendendo o Cliente",
    color: "#0891B2",
    icon: <MessageSquare className="w-6 h-6" />,
    description: "O contato foi estabelecido. Agora o objetivo é entender profundamente as necessidades, dores e expectativas do cliente.",
    actions: [
      "Registrar o resultado da conversa no card",
      "Documentar as principais necessidades identificadas",
      "Anotar o orçamento disponível e prazo do cliente",
      "Identificar os decisores envolvidos na compra",
      "Agendar o próximo passo (reunião, envio de proposta)",
    ],
    tip: "Pergunta-chave: \"O que o cliente precisa e como nossa solução resolve o problema dele?\"",
    tipType: "insight",
  },
  {
    id: 3,
    number: "03",
    title: "Proposta Enviada / Negociação",
    subtitle: "Apresentando a Solução",
    color: "#EA580C",
    icon: <FileText className="w-6 h-6" />,
    description: "Com as necessidades mapeadas, é hora de apresentar a solução e negociar. Esta etapa exige atenção especial às objeções.",
    actions: [
      "Registrar a data de envio da proposta no CRM",
      "Documentar o valor proposto e condições oferecidas",
      "Registrar as objeções levantadas pelo cliente",
      "Acompanhar o prazo de resposta e fazer follow-up",
      "Atualizar o card com cada interação realizada",
    ],
    tip: "Atenção: propostas sem resposta após 5 dias úteis exigem follow-up ativo. Use as Tarefas do CRM!",
    tipType: "alert",
  },
  {
    id: 4,
    number: "04",
    title: "Pedido Confirmado",
    subtitle: "Venda Ganha! 🎯",
    color: "#16A34A",
    icon: <Trophy className="w-6 h-6" />,
    description: "A etapa final e mais celebrada! Quando o cliente confirma, mova o card e marque como Ganha.",
    actions: [
      "Mover o card para \"Pedido Confirmado\"",
      "Registrar o valor final fechado",
      "Documentar as condições acordadas",
      "Marcar a negociação como \"Ganha\" no sistema",
      "Iniciar o processo de onboarding/entrega",
    ],
    tip: "Os dados de negociações ganhas alimentam os relatórios e ajudam a identificar padrões de sucesso para replicar.",
    tipType: "success",
  },
];

// Good/Bad practices
const GOOD_PRACTICES = [
  "Registre TODAS as interações com o cliente no CRM",
  "Mova os cards de etapa assim que houver avanço",
  "Mantenha o valor das negociações sempre atualizado",
  "Use as tarefas para não perder follow-ups importantes",
  "Não deixe negociações sem atividade por mais de 7 dias",
];

const BAD_PRACTICES = [
  "Não registrar contatos realizados (ligações, emails)",
  "Deixar negociações em etapas desatualizadas",
  "Criar múltiplas negociações para o mesmo cliente",
  "Ignorar os alertas e lembretes do sistema",
];

// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Funnel Stage Card Component
function FunnelStageCard({ stage, isActive, onClick }: { stage: typeof FUNNEL_STAGES[0]; isActive: boolean; onClick: () => void }) {
  const tipColors = {
    warning: "bg-amber-50 border-amber-300 text-amber-800",
    insight: "bg-teal-50 border-teal-300 text-teal-800",
    alert: "bg-red-50 border-red-300 text-red-800",
    success: "bg-green-50 border-green-300 text-green-800",
  };

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white cursor-pointer"
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Card Header */}
      <div
        className="p-5 flex items-center justify-between"
        style={{ backgroundColor: stage.color }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2 text-white">
            {stage.icon}
          </div>
          <div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest">{stage.number}</div>
            <h3 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {stage.title}
            </h3>
            <div className="text-white/80 text-sm">{stage.subtitle}</div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Card Body (Expandable) */}
      <motion.div
        initial={false}
        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className="p-5 space-y-4">
          <p className="text-stone-600 text-sm leading-relaxed">{stage.description}</p>

          <div>
            <h4 className="font-bold text-stone-700 text-sm mb-2 uppercase tracking-wide">O que fazer:</h4>
            <ul className="space-y-2">
              {stage.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: stage.color }} />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-xl p-3 border text-sm ${tipColors[stage.tipType as keyof typeof tipColors]}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{stage.tip}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Section Wrapper with animation
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [activeStage, setActiveStage] = useState<number | null>(1);
  const [activeNav, setActiveNav] = useState("inicio");

  const toggleStage = (id: number) => {
    setActiveStage(activeStage === id ? null : id);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveNav(id);
    }
  };

  // Update active nav on scroll
  useEffect(() => {
    const sections = ["inicio", "o-que-e", "mudanca", "funil", "boas-praticas", "resumo"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={IMAGES.rdLogo} alt="RD Station" className="w-8 h-8 rounded-full object-contain bg-teal-600 p-1" />
              <span className="font-bold text-stone-800 text-sm hidden sm:block" style={{ fontFamily: "'Nunito', sans-serif" }}>
                RD Station CRM — Guia
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: "inicio", label: "Início" },
                { id: "o-que-e", label: "O que é" },
                { id: "mudanca", label: "Mudança" },
                { id: "funil", label: "Funil" },
                { id: "boas-praticas", label: "Boas Práticas" },
                { id: "resumo", label: "Resumo" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeNav === item.id
                      ? "bg-teal-600 text-white"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-orange-400 blur-3xl"></div>
        </div>

        <div className="container relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6 border border-white/20">
                <Star className="w-4 h-4 text-orange-300" />
                <span>Apostila de Treinamento Interno — 2025</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                RD Station<br />
                <span className="text-orange-300">CRM</span>
              </h1>
              <p className="text-xl text-teal-100 leading-relaxed mb-8">
                Guia completo sobre as mudanças na carteira de clientes e as novas etapas do funil de vendas.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToSection("funil")}
                  className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  Ver o Funil de Vendas
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSection("mudanca")}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl border border-white/30 transition-all duration-200"
                >
                  O que mudou?
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                  <img src={IMAGES.crmInterface} alt="Interface RD Station CRM" className="w-full object-cover" />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-stone-500">Funil de Vendas</div>
                      <div className="font-bold text-stone-800 text-sm">4 Etapas Simplificadas</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-white/20 bg-black/10">
          <div className="container py-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-orange-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <AnimatedCounter value={1} suffix=" Carteira" />
                </div>
                <div className="text-teal-200 text-sm">Centralizada</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <AnimatedCounter value={4} suffix=" Etapas" />
                </div>
                <div className="text-teal-200 text-sm">Simplificadas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <AnimatedCounter value={100} suffix="%" />
                </div>
                <div className="text-teal-200 text-sm">No CRM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que é o RD Station CRM */}
      <section id="o-que-e" className="py-20 bg-white">
        <div className="container">
          <AnimatedSection>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-teal-600 font-bold text-sm uppercase tracking-widest mb-3">Sobre a Ferramenta</div>
                <h2 className="text-4xl font-bold text-stone-800 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  O que é o RD Station CRM?
                </h2>
                <p className="text-stone-600 text-lg leading-relaxed mb-8">
                  O <strong>RD Station CRM</strong> é uma ferramenta de gestão de relacionamento com clientes (CRM) desenvolvida pela RD Station, líder em soluções de marketing e vendas no Brasil.
                </p>
                <p className="text-stone-600 leading-relaxed mb-8">
                  A plataforma permite que equipes comerciais organizem, acompanhem e gerenciem todo o processo de vendas em um único lugar, eliminando planilhas dispersas e comunicações fragmentadas.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "🎯", label: "Centralização", desc: "Todas as negociações em um lugar" },
                    { icon: "👁️", label: "Visibilidade", desc: "Pipeline completo em tempo real" },
                    { icon: "📋", label: "Histórico", desc: "Registro de todas as interações" },
                    { icon: "📊", label: "Relatórios", desc: "Análise de desempenho da equipe" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-bold text-stone-700 text-sm">{item.label}</div>
                        <div className="text-stone-500 text-xs">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img src={IMAGES.rdFunil} alt="Funil de Vendas RD Station" className="w-full object-cover" />
                </div>
                <div className="absolute -top-4 -right-4 bg-teal-600 text-white rounded-2xl p-4 shadow-lg">
                  <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>#1</div>
                  <div className="text-xs text-teal-100">CRM do Brasil</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* A Grande Mudança */}
      <section id="mudanca" className="py-20 bg-stone-50">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-14">
              <div className="text-teal-600 font-bold text-sm uppercase tracking-widest mb-3">Novidade Importante</div>
              <h2 className="text-4xl font-bold text-stone-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Simplificamos para Você
              </h2>
              <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                Realizamos uma mudança estratégica para facilitar o dia a dia da equipe comercial.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {/* Before */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📁</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-500" style={{ fontFamily: "'Playfair Display', serif" }}>Antes</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Múltiplas carteiras separadas",
                    "Dificuldade em localizar negociações",
                    "Processos fragmentados e confusos",
                    "Duplicidade de registros",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-stone-500 text-sm">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="bg-orange-400 rounded-full p-4 shadow-lg"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              {/* After */}
              <div className="bg-teal-600 rounded-2xl p-8 shadow-lg text-white">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Agora</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Uma única carteira: Funil de Vendas",
                    "Todas as negociações em um só lugar",
                    "Processo linear e fácil de acompanhar",
                    "Visão clara do status de cada cliente",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-teal-200 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Funil de Vendas */}
      <section id="funil" className="py-20 bg-white">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-14">
              <div className="text-teal-600 font-bold text-sm uppercase tracking-widest mb-3">O Coração do CRM</div>
              <h2 className="text-4xl font-bold text-stone-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                As 4 Etapas do Funil de Vendas
              </h2>
              <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                Clique em cada etapa para ver os detalhes e as ações necessárias.
              </p>
            </div>

            {/* Visual Funnel Flow */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {FUNNEL_STAGES.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStage(stage.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                      activeStage === stage.id ? "text-white shadow-md scale-105" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                    style={activeStage === stage.id ? { backgroundColor: stage.color } : {}}
                  >
                    <span className="font-bold">{stage.number}</span>
                    <span className="hidden sm:inline">{stage.title.split(" / ")[0]}</span>
                  </button>
                  {index < FUNNEL_STAGES.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                  )}
                </div>
              ))}
            </div>

            {/* Stage Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {FUNNEL_STAGES.map((stage) => (
                <FunnelStageCard
                  key={stage.id}
                  stage={stage}
                  isActive={activeStage === stage.id}
                  onClick={() => toggleStage(stage.id)}
                />
              ))}
            </div>

            {/* Funnel Image Reference */}
            <div className="mt-12 bg-stone-50 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Como aparece no RD Station CRM
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  No sistema, as etapas aparecem como colunas no Funil de Vendas. Cada negociação é um card que você arrasta de uma coluna para outra conforme o avanço da venda.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200">
                <img src={IMAGES.funilEtapas} alt="Etapas no CRM" className="w-48 object-contain" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Boas Práticas */}
      <section id="boas-praticas" className="py-20 bg-stone-50">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-14">
              <div className="text-teal-600 font-bold text-sm uppercase tracking-widest mb-3">Para o Time</div>
              <h2 className="text-4xl font-bold text-stone-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Boas Práticas de Uso
              </h2>
              <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                Para que o CRM funcione bem para todos, é fundamental seguir as mesmas práticas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Good Practices */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-teal-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Regras de Ouro
                  </h3>
                </div>
                <ul className="space-y-4">
                  {GOOD_PRACTICES.map((practice, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-teal-50"
                    >
                      <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-stone-700 text-sm">{practice}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Bad Practices */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                    O que NÃO fazer
                  </h3>
                </div>
                <ul className="space-y-4">
                  {BAD_PRACTICES.map((practice, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-red-50"
                    >
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-stone-700 text-sm">{practice}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Visual Chart */}
                <div className="mt-6 p-4 bg-stone-50 rounded-xl">
                  <h4 className="text-sm font-bold text-stone-600 mb-3">Impacto do Registro Correto</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Previsibilidade de receita", value: 85 },
                      { label: "Visibilidade do pipeline", value: 92 },
                      { label: "Eficiência da equipe", value: 78 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs text-stone-500 mb-1">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="h-full bg-teal-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Resumo Final */}
      <section id="resumo" className="py-20 bg-teal-900 text-white">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-14">
              <div className="text-teal-300 font-bold text-sm uppercase tracking-widest mb-3">Recapitulando</div>
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                O que mudou e o que fazer agora
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-14">
              {/* Changes */}
              <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
                <h3 className="text-xl font-bold mb-6 text-teal-200" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ✅ O que mudou
                </h3>
                <ul className="space-y-4">
                  {[
                    "Agora temos apenas 1 carteira de clientes: o Funil de Vendas",
                    "O funil possui 4 etapas simplificadas e bem definidas",
                    "Todo o processo comercial acontece dentro do RD Station CRM",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-100">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div className="bg-orange-400/20 rounded-2xl p-8 border border-orange-400/30">
                <h3 className="text-xl font-bold mb-6 text-orange-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                  🚀 Próximos Passos
                </h3>
                <ul className="space-y-4">
                  {[
                    "Acesse o RD Station CRM e explore o Funil de Vendas",
                    "Cadastre suas negociações ativas nas etapas corretas",
                    "Em caso de dúvidas, consulte esta apostila ou seu gestor",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                      <span className="text-orange-100">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Funnel Flow Summary */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h3 className="text-center text-lg font-bold text-teal-200 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                O Fluxo Completo do Funil
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-4">
                {FUNNEL_STAGES.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-4">
                    <div
                      className="rounded-xl p-4 text-center min-w-[140px]"
                      style={{ backgroundColor: `${stage.color}30`, borderColor: `${stage.color}60`, border: "1px solid" }}
                    >
                      <div className="text-2xl font-bold mb-1" style={{ color: stage.color, fontFamily: "'Playfair Display', serif" }}>
                        {stage.number}
                      </div>
                      <div className="text-white text-xs font-medium leading-tight">{stage.title}</div>
                    </div>
                    {index < FUNNEL_STAGES.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={IMAGES.rdLogo} alt="RD Station" className="w-8 h-8 rounded-full object-contain bg-teal-600 p-1" />
              <span className="text-sm">RD Station CRM — Apostila de Treinamento Interno</span>
            </div>
            <div className="text-sm">Versão atualizada 2025</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
