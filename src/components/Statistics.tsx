
export const Statistics = () => {
  const stats = [
    {
      number: "23%",
      label: "Aumento na demanda por atendimento psicológico (SUS 2023-2024)",
      source: "DataSUS"
    },
    {
      number: "R$ 2,5bi",
      label: "Mercado de saúde digital no Brasil em 2024",
      source: "Saúde Business"
    },
    {
      number: "98%",
      label: "Eficácia comprovada do atendimento psicológico online",
      source: "Estudos CFP"
    },
    {
      number: "LGPD",
      label: "Conformidade total com proteção de dados sensíveis",
      source: "Lei 13.709/2018"
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dados que Comprovam a Necessidade
          </h2>
          <p className="text-xl text-gray-600">
            Nossa plataforma atende a uma demanda real e crescente no mercado brasileiro
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-700 font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500">
                Fonte: {stat.source}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
