# Direção visual da Home — armação preta

## Referências recebidas

A primeira imagem do usuário orienta a silhueta: aros panto arredondados, ponte em
fechadura e pequenos pinos metálicos horizontais. A segunda orienta o preto polido,
a espessura do acetato e os reflexos. A versão implementada usa lentes claras, como
na primeira referência. O modelo é uma interpretação ilustrativa feita em Three.js;
as fotografias não foram convertidas automaticamente em uma malha 3D.

## Pesquisa e decisões

| Referência | Observação relevante | Aplicação no projeto |
| --- | --- | --- |
| [Oliver Peoples Gregory Peck](https://www.oliverpeoples.com/en-us/products/0ov5186-1005) | Exemplo de armação preta arredondada, com galeria em diversos ângulos e medidas de frente, ponte e hastes. | Relação entre aros, ponte e prolongamento das hastes; referência de apresentação de produto. |
| [Persol PO3092V](https://www.persol.com/en-us/products/0po3092v-9014) | Frente de acetato de formato phantos com ponte em fechadura. | Curvas contínuas, frente única e proporção mais delicada que a primeira versão retangular. |
| [LINDBERG acetanium](https://lindberg.com/en/collections/acetanium) | Combina frente de acetato e hastes de titânio; explora a distinção visual entre materiais. | Referência complementar de acabamento e contraste. Não foram adotadas as soluções construtivas específicas da coleção. |
| [Partes dos óculos — Warby Parker](https://www.warbyparker.com/learn/different-parts-of-glasses) | Identifica frente, lentes, hastes, dobradiças e seus parafusos. | Organização das peças; a ponte e os pinos decorativos permanecem na frente. |

A busca visual também comparou fotografias de produto com vistas explodidas.
As páginas acima são referências de pesquisa, não fornecedores de imagens usadas
no site. Não há logos ou fotografias de terceiros incorporados à Home.

A sequência animada é uma apresentação visual: armação montada, giro de revelação,
retirada dos parafusos e afastamento de hastes e lentes. Não representa um manual
de reparo ou a mecânica exata de um produto comercial.

## Iluminação e animação

- [RoomEnvironment](https://threejs.org/docs/pages/RoomEnvironment.html): ambiente de estúdio calculado localmente e usado nos reflexos, sem baixar HDR.
- [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html): camada de brilho para o acetato e reflexos das lentes. Como o material tem custo por pixel, o canvas possui limites de densidade e área de renderização.
- [Renderização sob demanda](https://threejs.org/manual/pages/rendering-on-demand.html): renderiza após rolagem e redimensionamento, sem loop permanente quando o usuário está parado.

O canvas ocupa toda a tela atrás do navbar. A câmera ortográfica ajusta o
enquadramento às dimensões da montagem em cada fase; no mobile, uma inclinação
diagonal favorece o aproveitamento da tela. A cena só acompanha a rolagem de `#inicio`.

## Imagens geradas

Modo utilizado: ferramenta integrada de geração de imagens (`imagegen`), com as
imagens do usuário como referências. A segunda geração usou a primeira como base.
Os originais PNG permanecem no diretório de imagens geradas do Codex. As cópias do
projeto foram codificadas em JPEG, qualidade 90, preservando os 1672 × 941 pixels.

- `images/home/eyewear-assembled.jpg`: 105.186 bytes; apresentação e alternativa estática durante carregamento, sem WebGL ou com movimento reduzido.
- `images/home/eyewear-exploded-reference.jpg`: 116.062 bytes; referência de composição desmontada, sem importação no site.

### Prompt final — armação montada

```text
Use case: product-mockup
Asset type: full-screen optical website hero poster, also reference for a real-time 3D model.
Primary request: create a premium photorealistic studio product photograph of one assembled pair of black round panto optical eyeglasses, guided by the uploaded reference images. Image 1 is the primary shape reference: round slightly flattened upper rims, keyhole bridge, small horizontal silver endpiece accents. Image 2 is a supporting reference for polished deep-black acetate thickness and glossy highlights only. Use transparent clear prescription-style lenses with a very subtle smoke tint, NOT opaque sunglasses. Both temple arms are black and fully open, extending backward with curved ear tips. No brands or logos.
Composition: landscape 16:9 canvas, completely centered pair of glasses occupying about 82 percent of image width, viewed almost from front with just a small three-quarter perspective and slightly from above. Complete glasses, both temples and all edges visible; no clipping. Minimal warm off-white #eeefeb seamless studio background, soft grounded contact shadow, broad softbox reflections on polished acetate and clean lenses, fine silver hardware. Elegant editorial product photography, believable manufacture, smooth contours, bevels rather than sharp edges.
Constraints: single assembled pair, exact left-right consistency, no text, no lettering, no hands, no plants, no frames/borders, no UI, no extra objects. Match primary reference silhouette rather than rectangular glasses.
```

### Prompt final — vista desmontada

```text
Use case: product-mockup
Asset type: exploded-view art-direction reference for a scroll-driven eyewear 3D animation.
Primary request: show the EXACT black panto optical glasses from Image 1 in a precise, elegant exploded assembly, photographed in a studio. Preserve the same rounded front, keyhole bridge, silver horizontal corner pins, black polished acetate, and clear subtly smoke-tinted lenses. Landscape 16:9 warm off-white background, complete floating components visible with comfortable margins.
Composition: front frame centered; TWO shaped clear lenses moved forward and slightly downward from their matching openings; TWO full-length black temple arms detached at the outer hinge ends and moved outward/back; TWO tiny silver hinge screws hovering directly above the hinge axes. Frame front, bridge, integrated nose supports and decorative silver front pins remain one intact assembly. Both temples include their curved ear tips and hinge tabs. Camera three-quarter view from slightly above, angled enough to show depth, no overlap that obscures hardware. Generous separation and believable component alignment. Broad softbox lighting with clean polished reflections and soft shadow.
Constraints: exactly one pair of eyeglasses disassembled, seven main moving/structural pieces (one frame front, two lenses, two arms, two screws). No extra lenses, no fragmented rim halves, no impossible loose nose pads, no hands, no labels, no text, no UI, no brand logos. This is an illustrative exploded visualization, not a repair diagram. Match provided model faithfully.
```
