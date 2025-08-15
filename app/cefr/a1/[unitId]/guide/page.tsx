"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUnitById, canDoById } from "@/lib/cefr";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="grid gap-3 text-sm text-white/80">{children}</div>
    </section>
  );
}

function Example({ pt, en, note }: { pt: string; en: string; note?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="font-semibold">{pt}</div>
      <div className="text-xs text-white/70">{en}</div>
      {note && <div className="text-xs text-blue-300 mt-1">💡 {note}</div>}
    </div>
  );
}

export default function UnitGuidePage() {
  const params = useParams();
  const unitId = Array.isArray(params?.unitId) ? params?.unitId[0] : (params?.unitId as string);
  const unit = getUnitById(unitId);

  if (!unit) {
    return (
      <div className="container-max">
        <div className="card p-6">Unit not found</div>
      </div>
    );
  }

  return (
    <div className="container-max grid gap-6">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold text-gradient">{unit.title} • Guide</h1>
          <p className="text-white/70 text-sm">{unit.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/cefr/a1/${unit.id}`} className="btn btn-secondary text-xs">Back to Unit</Link>
        </div>
      </div>

      {/* Unit-specific guides */}
      {unit.id === "u0" && (
        <>
          <Section title="Pronunciation of European Portuguese (with PT examples)">
            <div>
              <div className="font-semibold text-white">Key sounds (English explanation):</div>
              <ul className="list-disc list-inside text-white/80">
                <li><span className="font-semibold">nh</span>: palatal nasal, similar to Spanish ñ (senhor ≈ se-<i>ny</i>-or).</li>
                <li><span className="font-semibold">lh</span>: palatal lateral (filho ≈ fi-<i>ly</i>-u), keep the tongue to the palate.</li>
                <li><span className="font-semibold">ão</span>: nasal vowel; let the air pass through the nose (pão, não).</li>
                <li><span className="font-semibold">r/rr</span>: strong guttural R at the start or with rr (carro with throat R).</li>
                <li><span className="font-semibold">ç</span>: sounds like English S (coração).</li>
              </ul>
              <div className="text-xs text-white/60 mt-2">Tip: Listen 2–3 times, repeat slowly. Focus on nasal airflow for -ão and on the palatal placement for nh/lh.</div>
            </div>
            <div>
              <div className="font-semibold text-white">Guided practice (Portuguese examples):</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="filho • manhã • pão • coração" en="son • morning • bread • heart" note="Target lh/nh/ão/ç" />
                <Example pt="carro • rua • rato • ratoeira" en="car • street • mouse • mousetrap" note="Strong R at start / between vowels" />
              </div>
            </div>
          </Section>

          <Section title="Alphabet & Spelling (English explanation + PT examples)">
            <div>
              <div className="font-semibold text-white">Letter names in EP (English note):</div>
              <div className="text-white/80 text-sm">a, bê, cê, dê, ê, efe, gê, agá, i, jota, cá, ele, eme, ene, o, pê, quê, erre, esse, tê, u, vê, dabliu (w), cs (x), ípsilon (y), zê</div>
              <div className="text-xs text-white/60 mt-2">Note: k, w, y mainly appear in loanwords. Spell emails with "ponto" (dot) and "arroba" (at).</div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <Example pt="Ana ponto silva arroba exemplo ponto com" en="ana.silva@example.com" note="Dictation model" />
              <Example pt="O meu número é nove um dois três quatro cinco." en="My number is 912345." note="Say individual digits at A1" />
            </div>
          </Section>

          <Section title="Numbers 0–20 (with English notes)">
            <div className="grid gap-2">
              <div className="text-white/80">0–10: zero, um/uma, dois/duas, três, quatro, cinco, seis, sete, oito, nove, dez</div>
              <div className="text-white/80">11–20: onze, doze, treze, catorze, quinze, dezasseis, dezassete, dezoito, dezanove, vinte</div>
              <div className="text-xs text-blue-300">European Portuguese uses <i>dezasseis</i>, <i>dezassete</i> (not Brazilian <i>dezesseis</i>, <i>dezessete</i>).</div>
              <div className="text-white/80">Useful Q&A: "Quantos anos tens?" → "Tenho vinte anos." (How old are you? → I am twenty.)</div>
            </div>
          </Section>

          <Section title="Mini Rules & Tips (English)">
            <ul className="list-disc list-inside text-white/80">
              <li>Definite articles: o/a (singular), os/as (plural).</li>
              <li>Common contractions: de + a → <span className="font-semibold">da</span>; a + o → <span className="font-semibold">ao</span>; em + a → <span className="font-semibold">na</span>.</li>
              <li>Politeness levels: <span className="font-semibold">Desculpe</span> (formal) vs <span className="font-semibold">Desculpa</span> (informal).</li>
            </ul>
          </Section>
        </>
      )}

      {unit.id === "u1" && (
        <>
          <Section title="Greetings & Etiquette (English explanation + PT examples)">
            <div className="grid gap-2">
              <div className="text-white/80">Use time-appropriate greetings: "Bom dia" (morning), "Boa tarde" (afternoon), "Boa noite" (evening/night).</div>
              <div className="text-white/80">Politeness: respond with "Obrigado/Obrigada" and consider using "senhor/senhora" with strangers.</div>
              <div className="text-xs text-white/60">Tip: default to formal with strangers; downgrade to informal with friends/peers.</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="Muito prazer." en="Nice to meet you." />
                <Example pt="Como se chama? / Como te chamas?" en="What is your name? (formal / informal)" />
              </div>
            </div>
          </Section>

          <Section title="Introductions & Nationalities (English guidance)">
            <div className="grid gap-2">
              <div className="text-white/80">Basic patterns: "Chamo‑me Ana." (My name is…) • "Sou de Lisboa." (I am from…)</div>
              <div className="text-white/80">Nationalities change for gender: português/portuguesa, inglês/inglesa, etc.</div>
              <div className="text-xs text-blue-300">Agreement: masculine ≠ feminine; learn pairs together.</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="Sou inglesa. Moro em Lisboa." en="I am English (f.). I live in Lisbon." />
                <Example pt="Ele é português." en="He is Portuguese." />
              </div>
            </div>
          </Section>

          <Section title="Formal vs Informal (English overview)">
            <ul className="list-disc list-inside text-white/80">
              <li>Formal: <span className="font-semibold">Desculpe</span>, <span className="font-semibold">Como se chama?</span> – often with <span className="font-semibold">senhor/senhora</span>.</li>
              <li>Informal: <span className="font-semibold">Desculpa</span>, <span className="font-semibold">Como te chamas?</span> – among friends/peers.</li>
              <li>In EP, "você" can sound distant/formal; it’s less common in everyday friendly contexts.</li>
            </ul>
            <div className="grid gap-2 md:grid-cols-2">
              <Example pt="Desculpe, pode repetir?" en="Excuse me, can you repeat? (formal)" />
              <Example pt="Desculpa, podes repetir?" en="Sorry, can you repeat? (informal)" />
            </div>
          </Section>

          <Section title="Grammar Essentials: ser / estar (English explanation)">
            <div className="grid gap-2">
              <div className="text-white/80">Use <span className="font-semibold">ser</span> for identity/origin ("Eu sou a Ana." / "Sou de Lisboa.").</div>
              <div className="text-white/80">Use <span className="font-semibold">estar</span> for temporary state/location ("Estou cansado." / "Estou em casa.").</div>
              <div className="text-xs text-white/60">At A1, memorize frequent patterns; full tense contrasts come later.</div>
            </div>
          </Section>

          <Section title="Pronunciation & Courtesy Tips (English)">
            <ul className="list-disc list-inside text-white/80">
              <li>In formal settings, always add <span className="font-semibold">por favor</span> and <span className="font-semibold">obrigado/obrigada</span>.</li>
              <li>Practice strong initial R and double RR; remember nh (ñ) and lh (Italian gl) feel.</li>
            </ul>
          </Section>
        </>
      )}

      {unit.id === "u2" && (
        <>
          <Section title="Numbers 21–100 & Ordinals (English explanation)">
            <div className="grid gap-2">
              <div className="text-white/80">Tens: vinte (20), trinta (30), quarenta (40), cinquenta (50), sessenta (60), setenta (70), oitenta (80), noventa (90), cem (100).</div>
              <div className="text-white/80">Form 21–99: tens + <span className="font-semibold">e</span> + unit (vinte e um, trinta e cinco, noventa e nove).</div>
              <div className="text-white/80">Ordinals (A1 core): 1.º/primeiro, 2.º/segundo, 3.º/terceiro, 4.º/quarto, 5.º/quinto. Agree by gender (1.ª/primeira).</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="setenta e cinco" en="seventy-five" />
                <Example pt="1.º andar" en="first floor" />
                <Example pt="2.ª porta" en="second door (fem.)" />
                <Example pt="Somos do 3.º piso." en="We are on the 3rd floor." />
              </div>
            </div>
          </Section>
          <Section title="Time & Dates (core patterns)">
            <div className="grid gap-2">
              <div className="text-white/80">Ask time: <i>Que horas são?</i> • State: <i>São duas e meia</i> (It’s 2:30). Quarters: <i>um quarto</i> (quarter past), <i>menos um quarto</i> (quarter to).</div>
              <div className="text-white/80">At X o’clock: <i>às</i> + hours (às oito); From… to…: <i>de</i> … <i>a</i>/<i>às</i> …</div>
              <div className="text-white/80">Dates: <i>5 de setembro de 2025</i>. Use <i>de</i> and no capitalization for months.</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="São três e um quarto." en="It’s 3:15." />
                <Example pt="São cinco menos um quarto." en="It’s 4:45 (quarter to five)." />
                <Example pt="A reunião é das 9 às 11." en="The meeting is from 9 to 11." />
                <Example pt="Hoje é 12 de março." en="Today is March 12th." />
              </div>
              <div className="text-xs text-white/60">Tip: For transport timetables, 24‑hour time is common: 14h30 = 2:30pm.</div>
            </div>
          </Section>
          <Section title="Phones & Prices (PT formatting)">
            <div className="grid gap-2">
              <div className="text-white/80">Say phone numbers digit by digit. Prices use decimal comma: 12,50 €. Read as <i>doze euros e cinquenta cêntimos</i>.</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="O meu número é 912 345 678." en="My number is 912 345 678." />
                <Example pt="Custa 2,20 €." en="It costs €2.20." />
              </div>
            </div>
          </Section>
        </>
      )}

      {unit.id === "u3" && (
        <>
          <Section title="Polite Ordering & Preferences (A1 patterns)">
            <div className="grid gap-2">
              <div className="text-white/80">Polite request: <i>Queria</i> + noun/inf., <i>Podia/pode</i> + inf.? Ordering: <i>Para mim</i> + item. Bill: <i>A conta, por favor.</i></div>
              <div className="text-white/80">Preferences: <i>Gosto de… / Não gosto de…</i> • Allergies: <i>Sou alérgico a…</i></div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="Queria um galão, por favor." en="I’d like a galão, please." />
                <Example pt="Para mim, o prato do dia." en="For me, the dish of the day." />
                <Example pt="Gosto de sopa; não gosto de cebola." en="I like soup; I don’t like onion." />
                <Example pt="A conta, por favor." en="The bill, please." />
              </div>
            </div>
          </Section>
          <Section title="Mini Grammar (articles, without/with)">
            <div className="text-white/80">Use <i>sem</i> (without) / <i>com</i> (with): <i>sem açúcar</i>, <i>com gelo</i>. Articles often included with menu items: <i>o café</i>, <i>a sopa</i>.</div>
            <div className="grid gap-2 md:grid-cols-2">
              <Example pt="Sem cebola, por favor." en="Without onion, please." />
              <Example pt="Com gelo, se faz favor." en="With ice, please (PT)." />
            </div>
          </Section>
        </>
      )}

      {unit.id === "u4" && (
        <>
          <Section title="Family & Possessives (agreement)">
            <div className="grid gap-2">
              <div className="text-white/80">Possessives agree with the possessed noun: <i>meu/minha; teus/tuas; seu/sua; nosso/nossa</i>.</div>
              <div className="text-white/80">Common family: <i>mãe, pai, irmã, irmão, filho, filha, avó, avô, tio, tia, primo, prima</i>.</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="A minha irmã é médica." en="My sister is a doctor." />
                <Example pt="Os nossos filhos estudam." en="Our children study." />
                <Example pt="O seu pai" en="Your (formal)/his/her father" />
                <Example pt="As suas irmãs" en="Your (formal)/his/her sisters" />
              </div>
            </div>
          </Section>
          <Section title="Articles & Gender/Number">
            <div className="text-white/80">Definite: <i>o/a/os/as</i>; Indefinite: <i>um/uma/uns/umas</i>. Gender and number agreement required: <i>a minha casa</i>, <i>os meus livros</i>.</div>
          </Section>
        </>
      )}

      {unit.id === "u5" && (
        <>
          <Section title="Directions: Contractions & Imperatives">
            <div className="grid gap-2">
              <div className="text-white/80">Core contractions: <i>de + o = do; de + a = da; em + o = no; em + a = na; a + o = ao; a + a = à</i>.</div>
              <div className="text-white/80">Imperatives (A1): <i>Vira à esquerda; segue em frente; continua até ao fim</i>.</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="Ao lado do supermercado" en="Next to the supermarket" />
                <Example pt="À direita da farmácia" en="To the right of the pharmacy" />
                <Example pt="Vira à esquerda no semáforo." en="Turn left at the traffic light." />
                <Example pt="Siga em frente até ao rio." en="Go straight until the river." />
              </div>
            </div>
          </Section>
          <Section title="Transport basics">
            <div className="text-white/80">Ask routes: <i>Como vou para…?</i> • Tickets/vocabulary: <i>bilhete, estação, paragem, linha, terminal</i>.</div>
          </Section>
        </>
      )}

      {unit.id === "u6" && (
        <>
          <Section title="Shopping: Sizes, Colors, Prices">
            <div className="grid gap-2">
              <div className="text-white/80">Sizes: <i>tamanho S/M/L</i>; Try: <i>Posso experimentar?</i>; Payment: <i>Multibanco</i> (card).</div>
              <div className="text-white/80">Prices with comma; ask discount: <i>Tem desconto?</i></div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="Tem o tamanho M?" en="Do you have size M?" />
                <Example pt="Posso pagar com multibanco?" en="Can I pay by card?" />
                <Example pt="Quanto custa este casaco?" en="How much is this coat?" />
                <Example pt="É muito caro/barato." en="It’s very expensive/cheap." />
              </div>
            </div>
          </Section>
          <Section title="Returns & Issues">
            <div className="text-white/80">Useful: <i>Queria devolver</i> (I’d like to return), <i>Não funciona</i> (It doesn’t work), <i>Tem recibo?</i> (Do you have the receipt?).</div>
          </Section>
        </>
      )}

      {unit.id === "u7" && (
        <>
          <Section title="Present Tense: regular patterns">
            <div className="grid gap-2">
              <div className="text-white/80">-ar (falar): eu <i>falo</i>, tu <i>falas</i>, ele/ela <i>fala</i>, nós <i>falamos</i>, vocês/eles <i>falam</i>.</div>
              <div className="text-white/80">-er (comer): eu <i>como</i>, tu <i>comes</i>, ele/ela <i>come</i>, nós <i>comemos</i>, vocês/eles <i>comem</i>.</div>
              <div className="text-white/80">-ir (abrir): eu <i>abro</i>, tu <i>abres</i>, ele/ela <i>abre</i>, nós <i>abrimos</i>, vocês/eles <i>abrem</i>.</div>
              <div className="text-white/80">Progressive (EP): <i>estar a + inf.</i> (Estou a estudar). Near future: <i>ir + inf.</i> (Vou comprar pão).</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="Eu trabalho em Lisboa." en="I work in Lisbon." />
                <Example pt="Eles comem às oito." en="They eat at eight." />
                <Example pt="Estou a aprender português." en="I am learning Portuguese." />
                <Example pt="Vamos visitar o museu." en="We are going to visit the museum." />
              </div>
            </div>
          </Section>
          <Section title="Routine & Frequency">
            <div className="text-white/80">Adverbs: <i>sempre, muitas vezes, às vezes, raramente, nunca</i>. Typical routine verbs: <i>acordar, trabalhar, estudar, cozinhar, descansar</i>.</div>
          </Section>
        </>
      )}

      {unit.id === "u8" && (
        <>
          <Section title="Health & Emergencies (core phrases)">
            <div className="grid gap-2">
              <div className="text-white/80">Symptoms: <i>Tenho dor de cabeça; Tenho febre; Estou doente</i>. Pharmacy: <i>farmácia, receita, medicamento</i>. Emergency: call <i>112</i>.</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="Preciso de um médico." en="I need a doctor." />
                <Example pt="Onde fica a farmácia?" en="Where is the pharmacy?" />
                <Example pt="Pode ajudar-me, por favor?" en="Can you help me, please?" />
                <Example pt="Tenho alergia a penicilina." en="I’m allergic to penicillin." />
              </div>
            </div>
          </Section>
          <Section title="At the pharmacy (requests)">
            <div className="text-white/80">Requests: <i>Queria algo para a tosse</i>; <i>Tem comprimidos para a dor?</i>; <i>Devo tomar antes/depois das refeições?</i></div>
          </Section>
        </>
      )}

      {unit.id === "u9" && (
        <>
          <Section title="Weather & Small Talk">
            <div className="grid gap-2">
              <div className="text-white/80">Weather: <i>Está sol; Está a chover; Está nublado; Há vento</i>. Small talk: simple positive/neutral remarks + questions.</div>
              <div className="grid gap-2 md:grid-cols-2">
                <Example pt="Está muito vento hoje." en="It’s very windy today." />
                <Example pt="Que tempo faz amanhã?" en="What will the weather be like tomorrow?" />
                <Example pt="Vamos tomar um café?" en="Shall we have a coffee?" />
                <Example pt="Gosto muito desta cidade." en="I really like this city." />
              </div>
            </div>
          </Section>
          <Section title="Culture (Portugal quick notes)">
            <ul className="list-disc list-inside text-white/80">
              <li>Café culture: <i>bica</i> (Lisbon espresso), <i>cimbalino</i> (Porto), <i>galão</i> (milky).</li>
              <li>Politeness: <i>por favor, obrigado/obrigada</i>. With strangers: <i>senhor/senhora</i> is common.</li>
              <li>Conversation: keep sentences short; use simple follow‑ups: <i>E você?/E tu?</i></li>
            </ul>
          </Section>
        </>
      )}

      {unit.id !== "u0" && unit.id !== "u1" && unit.id !== "u2" && unit.id !== "u3" && unit.id !== "u4" && unit.id !== "u5" && unit.id !== "u6" && unit.id !== "u7" && unit.id !== "u8" && unit.id !== "u9" && (
        <Section title="Overview & Tips">
          <div className="text-white/80 text-sm">Detailed guide for this unit coming next. Meanwhile, explore the micro‑lessons and milestones. Each lesson includes in‑context rules and examples.</div>
        </Section>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Link href={`/cefr/a1/${unit.id}`} className="card p-4 hover-lift text-center">⏮️ Back to Unit</Link>
        <Link href="/practice" className="card p-4 hover-lift text-center">📚 Review 10</Link>
        <Link href="/arcade" className="card p-4 hover-lift text-center">🕹️ Play a Game</Link>
      </div>
    </div>
  );
} 