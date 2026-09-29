import { Presentation } from '../types';

export const SAMPLE_PRESENTATIONS: Presentation[] = [
  {
    id: 'quantum-heisenberg',
    title: 'Mecánica Cuántica: Superposición e Incertidumbre de Heisenberg',
    category: 'Física Cuántica',
    author: 'Prof. Richard Feynman (Seminario Teórico)',
    description: 'De la dualidad onda-partícula a las desigualdades de Heisenberg y el colapso de la función de onda.',
    slides: [
      {
        id: 'qm-1',
        slideNumber: 1,
        title: 'La Ruptura del Determinismo Clásico',
        subtitle: 'El experimento de la doble rendija y el misterio central',
        bullets: [
          'En física clásica, una partícula viaja por una trayectoria definida determinista.',
          'Al enviar electrones individuales a través de dos rendijas, surge un patrón de interferencia ondulatoria.',
          'Si colocamos un detector para ver por qué rendija pasó, el patrón de interferencia desaparece instantáneamente.',
          'La naturaleza no solo nos oculta información: la información aún no existe antes de la medición.'
        ],
        keyConcept: 'Dualidad Onda-Partícula y el acto de observación como perturbación irreducible.',
        deepEquationOrFormula: '|Ψ⟩ = c₁|Rendija 1⟩ + c₂|Rendija 2⟩  con  P = |Ψ|²',
        feynmanAnalogyHint: 'No pienses en el electrón como una bola de billar ni como agua en una piscina; es un "número de probabilidad giratorio" (fasor) que explora todas las trayectorias a la vez.',
        thumbnailColor: 'from-cyan-900 to-blue-900'
      },
      {
        id: 'qm-2',
        slideNumber: 2,
        title: 'El Principio de Incertidumbre de Heisenberg',
        subtitle: 'El límite intrínseco al conocimiento simultáneo',
        bullets: [
          'Formulado por Werner Heisenberg en 1927 a partir de operadores no conmutativos.',
          'No es un error de los instrumentos ni imperfección del microscopio: es una propiedad matemática de ondas conjugadas de Fourier.',
          'Para ubicar con extrema precisión una partícula (Δx pequeño), necesitas fotones de alta energía (longitud de onda corta), lo que transfiere un momento impredecible (Δp grande).'
        ],
        keyConcept: 'Incompatibilidad de observables conjugados: Posición y Momento.',
        deepEquationOrFormula: 'Δx · Δp ≥ ℏ / 2   (donde ℏ = h / 2π ≈ 1.054 × 10⁻³⁴ J·s)',
        feynmanAnalogyHint: 'Intenta atrapar una nota musical pura: un sonido extremadamente corto (como un chasquido) no tiene tono definido (frecuencia dispersa); para escuchar el tono exacto necesitas que la nota dure en el tiempo.',
        thumbnailColor: 'from-blue-900 to-indigo-900'
      },
      {
        id: 'qm-3',
        slideNumber: 3,
        title: 'Operadores y Conmutadores: El Motor Matemático',
        subtitle: 'Por qué el orden de los factores sí altera el producto',
        bullets: [
          'En mecánica cuántica, las propiedades físicas son operadores hermíticos actuando sobre un espacio de Hilbert.',
          'El conmutador [A, B] = AB - BA mide si dos magnitudes pueden conocerse con precisión simultánea.',
          'Cuando el conmutador no es cero, no existe una base común de estados propios.'
        ],
        keyConcept: 'No conmutatividad del álgebra de observables cuánticos.',
        deepEquationOrFormula: '[x̂, p̂] = x̂p̂ - p̂x̂ = iℏI',
        feynmanAnalogyHint: 'Ponerte los calcetines y luego los zapatos produce un resultado totalmente distinto a ponerte los zapatos y luego intentar ponerte los calcetines.',
        thumbnailColor: 'from-indigo-900 to-purple-900'
      },
      {
        id: 'qm-4',
        slideNumber: 4,
        title: 'Incertidumbre Energía-Tiempo y Efecto Túnel',
        subtitle: 'Pedir prestada energía al vacío cósmico',
        bullets: [
          'ΔE · Δt ≥ ℏ / 2 permite violaciones locales aparentes de la conservación de la energía durante lapsos ultracortos.',
          'Partículas virtuales surgen y se aniquilan en el vacío cuántico.',
          'En el efecto túnel cuántico, una partícula atraviesa una barrera de potencial más alta que su energía cinética (base del microscopio de efecto túnel y la fusión solar).'
        ],
        keyConcept: 'Fluctuaciones del vacío y penetración de barreras de potencial.',
        deepEquationOrFormula: 'T ≈ exp( -2 ∫ √(2m(V(x) - E)) / ℏ dx )',
        feynmanAnalogyHint: 'Es como si lanzaras una pelota de tenis contra una pared de ladrillo y 1 de cada 1000 veces la pelota apareciera del otro lado sin romper la pared, porque su "cola de onda" se filtró.',
        thumbnailColor: 'from-purple-900 to-pink-900'
      },
      {
        id: 'qm-5',
        slideNumber: 5,
        title: 'Superposición y el Paradoja del Colapso',
        subtitle: '¿Qué significa realmente medir en mecánica cuántica?',
        bullets: [
          'La ecuación de Schrödinger es lineal, determinista y reversible: d|Ψ⟩/dt = -iĤ|Ψ⟩/ℏ.',
          'Sin embargo, al medir observamos un valor propio discreto con probabilidad dada por la regla de Born.',
          'Interpretación de Copenhague (colapso físico instantáneo) vs Muchos Mundos (decoherencia sin colapso).'
        ],
        keyConcept: 'El problema de la medición y la frontera cuántico-clásica (Decoherencia).',
        deepEquationOrFormula: 'P(a_k) = |⟨ϕ_k | Ψ⟩|²',
        feynmanAnalogyHint: 'Una moneda girando en la mesa no es ni cara ni cruz mientras gira; solo cuando cae forzamos un desenlace. La física clásica creía que la moneda ya tenía cara definida antes de mirar.',
        thumbnailColor: 'from-pink-900 to-rose-900'
      }
    ]
  },
  {
    id: 'transformers-attention',
    title: 'Arquitecturas Transformer & Mecanismo de Auto-Atención',
    category: 'Inteligencia Artificial',
    author: 'Seminario de Deep Learning Avanzado',
    description: 'Análisis conceptual profundo de Attention Is All You Need, matrices Q, K, V y modelos fundacionales.',
    slides: [
      {
        id: 'tf-1',
        slideNumber: 1,
        title: 'El Cuello de Botella Secuencial de las RNNs y LSTMs',
        subtitle: 'Por qué procesar palabra por palabra frenaba el avance',
        bullets: [
          'Las Redes Recurrentes (RNN/LSTM) procesan texto paso a paso: h_t = f(h_{t-1}, x_t).',
          'Problema 1: Imposible de paralelizar en GPUs modernas (complejidad temporal O(N) secuencial).',
          'Problema 2: Desvanecimiento del gradiente e incapacidad de recordar dependencias a larga distancia.',
          'Solución Transformer: Descartar la recurrencia por completo y conectar todos los tokens directamente.'
        ],
        keyConcept: 'Ruptura de la dependencia temporal estricta mediante cálculo matricial directo.',
        deepEquationOrFormula: 'h_t = tanh(W · h_{t-1} + U · x_t)  →  O(N) cuello de botella',
        feynmanAnalogyHint: 'Una RNN es como el juego del teléfono descompuesto: cada persona susurra al siguiente y al final de la fila el mensaje original se distorsiona. El Transformer pone a todos en una sala redonda donde todos se miran directamente a la vez.',
        thumbnailColor: 'from-amber-900 to-orange-900'
      },
      {
        id: 'tf-2',
        slideNumber: 2,
        title: 'La Tríada de la Atención: Query, Key y Value',
        subtitle: 'El sistema de consulta de base de datos diferenciable',
        bullets: [
          'Para cada palabra o token generamos 3 vectores multiplicando por matrices de pesos aprendidas:',
          'Query (Q): "¿Qué información estoy buscando en este contexto?"',
          'Key (K): "¿Qué información ofrezco yo a los demás?"',
          'Value (V): "El contenido semántico real que transmito si coincido con tu búsqueda."'
        ],
        keyConcept: 'Búsqueda por similitud coseno suave en un espacio latente de alta dimensión.',
        deepEquationOrFormula: 'Attention(Q, K, V) = softmax( (Q · K^T) / √d_k ) · V',
        feynmanAnalogyHint: 'Imagina una biblioteca: vas al mostrador con una consulta escrita (Query), comparas tu consulta con los títulos de los libros (Keys), y de los libros que más coinciden tomas sus páginas interiores (Values).',
        thumbnailColor: 'from-orange-900 to-amber-900'
      },
      {
        id: 'tf-3',
        slideNumber: 3,
        title: '¿Por qué Dividir por √d_k? El Factor de Escala',
        subtitle: 'El detalle matemático sutil que evita el colapso de gradientes',
        bullets: [
          'Si d_k (la dimensión del vector) es grande (ej: 64 o 128), el producto escalar Q · K^T crece en magnitud.',
          'Si dos vectores tienen componentes normales con media 0 y varianza 1, su producto escalar tiene varianza d_k.',
          'Valores muy grandes empujan la función Softmax hacia regiones con gradientes casi nulos (saturación).',
          'Dividir por √d_k restablece la varianza unitaria y mantiene el flujo de gradiente saludable.'
        ],
        keyConcept: 'Normalización de varianza para estabilidad numérica del Softmax.',
        deepEquationOrFormula: 'Var(∑ q_i · k_i) = d_k  ⇒  Var( (q · k) / √d_k ) = 1',
        feynmanAnalogyHint: 'Si gritas en un megáfono muy cerca de un micrófono, el amplificador se satura y solo escuchas ruido blanco estático. Dividir por √d_k es como bajar la ganancia del micrófono para distinguir los susurros.',
        thumbnailColor: 'from-amber-900 to-yellow-900'
      },
      {
        id: 'tf-4',
        slideNumber: 4,
        title: 'Multi-Head Attention: Múltiples Perspectivas Simultáneas',
        subtitle: 'Un solo par de ojos no es suficiente para entender el lenguaje',
        bullets: [
          'En lugar de calcular atención una sola vez con vectores gigantes, proyectamos en h "cabezas" más pequeñas.',
          'Cabeza 1 puede rastrear concordancia gramatical (sujeto - verbo).',
          'Cabeza 2 puede resolver pronombres (ej: "el banco ... él estaba cerrado").',
          'Cabeza 3 puede detectar relaciones de causa y efecto a cientos de tokens de distancia.'
        ],
        keyConcept: 'Atención multi-perspectiva en subespacios de representación ortogonales.',
        deepEquationOrFormula: 'MultiHead(Q,K,V) = Concat(head_1, ..., head_h) · W^O',
        feynmanAnalogyHint: 'Es como una junta directiva analizando un contrato: el abogado revisa la ley, el contador revisa los números y el ingeniero revisa la viabilidad técnica al mismo tiempo.',
        thumbnailColor: 'from-yellow-900 to-emerald-900'
      },
      {
        id: 'tf-5',
        slideNumber: 5,
        title: 'Codificación Posicional: Devolviendo el Sentido del Orden',
        subtitle: 'Funciones sinusoidales para no olvidar el antes y el después',
        bullets: [
          'La auto-atención pura es invariante a permutaciones: para la matriz no hay diferencia entre "el perro mordió al hombre" y "el hombre mordió al perro".',
          'Para inyectar el orden sin usar recurrencia, sumamos vectores posicionales únicos a cada token.',
          'Usar senos y cosenos de frecuencias crecientes permite al modelo aprender distancias relativas fácilmente.'
        ],
        keyConcept: 'Inyección geométrica de orden temporal en arquitecturas paralelas.',
        deepEquationOrFormula: 'PE_{(pos, 2i)} = sin(pos / 10000^{2i/d}) ,  PE_{(pos, 2i+1)} = cos(pos / 10000^{2i/d})',
        feynmanAnalogyHint: 'Como las manecillas de un reloj: el segundero gira rápido, el minutero a velocidad media y el horario muy lento. Combinando las posiciones de las 3 manecillas sabes el instante exacto del día.',
        thumbnailColor: 'from-emerald-900 to-teal-900'
      }
    ]
  },
  {
    id: 'raft-consensus',
    title: 'Sistemas Distribuidos: Algoritmo de Consenso Raft',
    category: 'Ciencias de la Computación',
    author: 'Seminario de Arquitectura de Sistemas Distribuidos',
    description: 'Comprendiendo cómo múltiples computadoras independientes acuerdan un único estado fiable ante fallos.',
    slides: [
      {
        id: 'raft-1',
        slideNumber: 1,
        title: 'El Desafío del Consenso en Redes Asíncronas',
        subtitle: 'Caídas de nodos, particiones de red y mensajes perdidos',
        bullets: [
          'En un cluster distribuido, los servidores pueden colapsar o la red puede partirse (Split-Brain).',
          '¿Cómo garantizar que todos los nodos apliquen las mismas transacciones en el mismo orden exacto?',
          'Paxos era matemáticamente correcto pero casi imposible de entender e implementar en la práctica.',
          'Raft fue diseñado explícitamente en Stanford con un objetivo central: ser comprensible por humanos.'
        ],
        keyConcept: 'Máquina de Estados Replicada (Replicated State Machine) sobre red no confiable.',
        deepEquationOrFormula: 'Quorum = ⌊N / 2⌋ + 1   (Se requiere mayoría estricta)',
        feynmanAnalogyHint: 'Un grupo de amigos tratando de ponerse de acuerdo en qué restaurante cenar por mensajes de texto mientras a algunos se les apaga la batería y a otros se les corta la señal.',
        thumbnailColor: 'from-indigo-900 to-violet-900'
      },
      {
        id: 'raft-2',
        slideNumber: 2,
        title: 'Los Tres Estados Fundamentales y el Tiempo en Mandatos',
        subtitle: 'Líder, Seguidor y Candidato a través de Términos (Terms)',
        bullets: [
          'Cada nodo está en uno de 3 roles en todo momento: Seguidor (Follower), Candidato (Candidate) o Líder (Leader).',
          'El tiempo avanza en Términos (Terms) numerados con enteros monotónicamente crecientes.',
          'El Líder maneja todas las peticiones de los clientes y las replica a los seguidores.',
          'Los Seguidores son pasivos: responden a latidos de corazón (heartbeats) del Líder.'
        ],
        keyConcept: 'Descomposición del problema: Elección de líder + Replicación de log + Seguridad.',
        deepEquationOrFormula: 'Term_current ≤ Term_incoming  ⇒  Actualización inmediata de término',
        feynmanAnalogyHint: 'Una monarquía parlamentaria donde el rey debe enviar un mensajero cada semana con un sello fresco diciendo "sigo vivo". Si no llega en un plazo aleatorio, un noble se postula a nuevo rey.',
        thumbnailColor: 'from-violet-900 to-purple-900'
      },
      {
        id: 'raft-3',
        slideNumber: 3,
        title: 'Elecciones de Líder con Temporizadores Aleatorios',
        subtitle: 'La clave simple para evitar empates infinitos (Split Votes)',
        bullets: [
          'Si un seguidor no recibe un heartbeat antes de que expire su temporizador de elección (ej: entre 150ms y 300ms), inicia una elección.',
          'Incrementa su término actual, vota por sí mismo y envía RequestVote a todos los demás nodos.',
          'El primero que alcance la mayoría (N/2 + 1) se convierte en Líder y comienza a emitir heartbeats inmediatamente.',
          'La aleatorización de tiempos asegura que rara vez dos nodos inicien elecciones exactamente al mismo milisegundo.'
        ],
        keyConcept: 'Ruptura de simetría probabilística para lograr consenso rápido.',
        deepEquationOrFormula: 'timeout ∼ Uniform(T_min, 2 · T_min)',
        feynmanAnalogyHint: 'Imagina que varios oradores quieren el micrófono. Si todos esperan exactamente 5 segundos de silencio para hablar, todos empezarán a gritar juntos. Si cada uno espera un tiempo aleatorio entre 3 y 7 segundos, uno hablará primero sin interrupción.',
        thumbnailColor: 'from-purple-900 to-rose-900'
      },
      {
        id: 'raft-4',
        slideNumber: 4,
        title: 'Replicación y Compromiso del Log (Log Replication)',
        subtitle: 'El contrato inmutable de entradas confirmadas',
        bullets: [
          'El cliente envía un comando al Líder.',
          'El Líder añade el comando como una nueva entrada en su propio log y envía AppendEntries a los seguidores.',
          'Cuando la mayoría de seguidores responde que guardaron la entrada, el Líder la considera "Comprometida" (Committed).',
          'Una vez comprometida, el comando se aplica a la máquina de estados y el resultado vuelve al cliente.'
        ],
        keyConcept: 'Invariante de emparejamiento de log (Log Matching Property).',
        deepEquationOrFormula: 'Log[index].term == MatchTerm  ⇒  Logs idénticos en todos los índices ≤ index',
        feynmanAnalogyHint: 'Un notario que escribe en su libro, fotocopia la página a las sucursales, y solo cuando la mayoría de sucursales sellan de recibido, declara legalmente vinculante el contrato.',
        thumbnailColor: 'from-rose-900 to-slate-900'
      }
    ]
  }
];
