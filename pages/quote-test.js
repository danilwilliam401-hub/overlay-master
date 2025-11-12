import { useState } from 'react';

export default function QuoteTest() {
  const [design, setDesign] = useState('quote1');
  const [title, setTitle] = useState('The only way to do great work is to love what you do');
  const [website, setWebsite] = useState('Steve Jobs');
  const [refreshKey, setRefreshKey] = useState(Date.now()); // Add refresh key for cache busting

  const quoteDesigns = {
    'quote1': 'Bold Quote Overlay (Anton) - Pure black background',
    'quote2': 'Elegant Quote Overlay (Playfair Display) - Dark charcoal',
    'quote3': 'Impact Quote Overlay (Impact) - Gradient black'
  };

  const inspirationalQuotes = [
    "The only way to do great work is to love what you do",
    "Your dreams don't have an expiration date",
    "Success is not final, failure is not fatal",
    "Believe you can and you're halfway there",
    "The future belongs to those who believe in the beauty of their dreams",
    "It always seems impossible until it's done",
    "Don't watch the clock; do what it does. Keep going",
    "The only limit to our realization of tomorrow will be our doubts of today"
  ];

  const authors = [
    "Steve Jobs", "Unknown", "Winston Churchill", "Theodore Roosevelt", 
    "Eleanor Roosevelt", "Nelson Mandela", "Sam Levenson", "Franklin D. Roosevelt"
  ];

  const tagalogQuotes = [
    "Ang taong walang pangarap ay parang barko na walang direksyon",
    "Huwag kang susuko, kahit gaano pa kahirap ang buhay",
    "Ang tagumpay ay nagsisimula sa pag-asa at determinasyon",
    "Kapag may tiyaga, may nilaga",
    "Ang tunay na lakas ay nagmumula sa loob",
    "Walang imposible sa taong may pangarap at sipag",
    "Ang bawat pagsubok ay pagkakataon upang lumago",
    "Magtiwala sa proseso, ang tagumpay ay darating",
    "Huwag matakot sa pagkakamali, ito ay bahagi ng pag-aaral",
    "Ang iyong kinabukasan ay nabubuo ng iyong mga desisyon ngayon"
  ];

  const tagalogAuthors = [
    "Karunungang Pilipino", "Kasabihan", "Inspirasyon", "Karunungan",
    "Pag-asa", "Sipag at Tiyaga", "Karanasan", "Positibong Pag-iisip",
    "Aral ng Buhay", "Pangarap"
  ];

 const hugotQuotes = [
  "Sa tamang panahon may isang taong magpapatunay sayo kung bakit ka para sa kanya at kung bakit hindi ka para sa iba.",
  "Di ko man maisigaw sa buong mundo kung sino ang mahal ko, sapat nang alam natin pareho na ikaw ang tinutukoy ko.",
  "Kung pwede lang maging excuse ang pagiging broken hearted, malamang marami ng absent sa high school at college.",
  "Wag mong isiksik ang sarili mo sa taong hindi marunong magpahalaga sa nararamdaman mo. Masasaktan ka lang.",
  "Mahirap kumalma lalo na kapag selos na selos ka na.",
  "Sana isinusulat na ang feelings, para madali lang burahin.",
  "Sana thesis na lang ako na ipaglalaban mo kahit hirap na hirap ka na.",
  "Balang araw makakaya ko na ulit na tingnan ka ng wala na akong nararamdaman pa.",
  "Mahirap mag-let go. Pero mas mahirap yung kumakapit ka pa, tinutulak ka na.",
  "May mga tao talaga na kahit napapasaya ka, kaylangan mong iwasan.",
  "Hindi na baleng siya ang bumitaw. Ang importante alam mong lumaban ka hanggang sa wala ka ng maipaglaban.",
  "Hindi mo kailangang mamili sa aming dalawa. Handa akong lumabas sa puso mo para lang sumaya ka sa piling niya.",
  "Ang hirap bitawan nung taong kahit hindi kayo, siya yung nagpapasaya at kumukumpleto ng araw mo!",
  "Pag hindi ka mahal ng mahal mo, wag ka magreklamo. Kasi may mga tao rin na di mo mahal pero mahal ka. Kaya quits lang.",
  "Alam mo kung bakit nasasaktan ka? Kasi iniisip mo na gusto ka rin niya kahit hindi naman talaga.",
  "Dapat ba akong ngumiti dahil magkaibigan tayo? O dapat ba kong malungkot dahil hanggang dun lang tayo?",
  "Hindi tamang gumamit ka ng ibang tao para maka move-on ka. Ginagago mo na nga ang sarili mo, nakasakit ka pa ng iba.",
  "Ibinigay ko na ang lahat pero hindi pa rin sapat.",
  "Lahat tayo napapagod. Wag mong hintayin na mawala pa siya sa buhay mo bago mo siya pahalagahan.",
  "Yung naghihintay ka sa isang bagay na imposible namang mangyari.",
  "Ang oras ay isang mahalagang elemento sa mundo. Bumibilis kapag masaya, at bumabagal kapag wala ka.",
  "Masakit isipin na dahil sa isang pangyayari hindi na kayo pwedeng maging tulad ng dati.",
  "Yung akala mo minahal ka niya pero hindi pala.",
  "Sana tinuruan mo 'ko kung paano madaling makalimot tulad ng ginawa mong paglimot sa'kin.",
  "Buti pa ang ngipin nabubunot kapag masakit. Sana ang puso ganun din.",
  "Minsan kahit sabihin mong suko ka na, kapag naalala mo kung paano ka niya napasaya, bumabalik ka ulit sa pagiging tanga.",
  "Minsan kailangan tayong masaktan bago tayo matauhan.",
  "Minsan kung sino pa yung rason mo kung bakit ka masaya, siya din ang rason kung bakit masasaktan ka ng sobra.",
  "Kung talagang mahal ka nyan mageefort yan kahit di ka mag-demand.",
  "Kapag nasasaktan ka, pwede kang umiyak. Tao lang tayo hindi superhero.",
  "Tao ka kaya hindi ka exempted masaktan.",
  "Kaya may monthsary ay dahil hindi lahat ng relasyon ay umaabot ng anniversary.",
  "Bago mo ko hawakan, pwede ko bang malaman kung paano mo bibitiwan?",
  "Hindi lahat ng nagsasama ay nagmamahalan at hindi lahat ng nagmamahalan ay magkasama.",
  "Ang salitang 'I love you' ay hindi tanong. Pero bakit masakit pag walang sagot.",
  "Tulungan mo ang sarili mo na makalimot. Wag mong tulungan ang sarili mong masaktan.",
  "Dapat matuto tayong bumitaw. Dahil mas okay ang maging malungkot ng panandalian kesa magmukhang tanga ng matagalan.",
  "Huwag kang malungkot kung iniwan ka niya ang mahalaga ay napadama mo sa kanya kung gaano mo sya kamahal.",
  "Kapag alam mong wala nang pagmamahal, wag mo nang ipagsiksikan ang sarili mo. Sa huli ikaw rin ang talo.",
  "Mas pipiliin kong ako na lang ang masaktan kaysa magkasama nga tayo pero sya naman ang hinahanap ng puso mo.",
  "Ginawa ang break-up para ilayo tayo sa maling tao na akala natin ay tama.",
  "Ang PAG-IBIG parang harutan. Minsan hindi mo maiiwasang hindi MASAKTAN.",
  "Hindi naman masamang maging selfish. May mga bagay lang talaga na hindi pwedeng may kahati.",
  "Kung hindi mo mahal ang isang tao, wag ka nang magpakita ng motibo para mahalin ka nya.",
  "Huwag mong bitawan ang bagay na hindi mo kayang makitang hawakan ng iba.",
  "Huwag mong hawakan kung alam mong bibitawan mo lang.",
  "Huwag na huwag ka hahawak kapag alam mong may hawak ka na.",
  "Wag magpakatanga sa PAG-IBIG. 'Cause GOD gave you REAL EYES to REALIZE the REAL LIES.",
  "Wag mong gawing soccer ang pag-ibig na pagkatapos mong sipain, saka mo hahabulin.",
  "Mahal mo? Ipaglaban mo parang pangarap mo.",
  "May mga bagay na masarap ingatan kahit hindi sayo. Parang ikaw, ang sarap mahalin kahit hindi tayo.",
  "Bakit ba naman kasi maglilihim kung pwede mo namang sabihin? Hindi yung kung kelan huli na ang lahat tsaka mo aaminin.",
  "Hindi lahat ng kaya mong intindihin ay katotohanan at hindi lahat ng hindi mo kayang intindihin ay kasinungalingan.",
  "Sa panahon ngayon, joke na ang totoo at promise na ang panloloko.",
  "Binabalewala mo siya tapos kapag nakita mo siyang masaya sa iba, masasaktan at magagalit ka. Ano ka, tanga?",
  "Kapag pagod ka na, bitawan mo na. Hindi yung nagpapaka-tanga ka madami pa namang mas better sa kanya.",
  "May mga feelings talaga na hanggang social media na lang.",
  "Pinakilig ka lang akala mo mahal ka na? Sige, assume pa!",
  "Hindi lahat ng nararamdaman ay dapat sabihin. Dahil hindi lahat ng sinasabi ay kayang maramdaman.",
  "Yung feeling na may narinig kang kanta, tapos naalala mo siya.",
  "Twitter ka ba? Bakit? Trending ka kasi sa puso ko.",
  "Sana gawin nang herbal medicine ang MAKAHIYA, para may gamot na sa mga taong MAKAKAPAL ANG MUKHA.",
  "Mas okay na yung friendship na parang may something, kaysa sa relationship na parang nothing.",
  "Matuto kang sumuko kapag nasasaktan ka na ng sobra. Minsan kasi ginagago ka na, kinikilig ka pa.",
  "May taong binigay ng Diyos para lang makilala mo at hindi para makasama mo.",
  "Lahat tayo binigyan ng pagkakataong maging tanga pero hindi porket libre ay araw-arawin mo na.",
  "Ang tunay na lalake nagbabago para sa babae, hindi yong pabago-bago ng babae.",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Hintayin mo ang true love mo. Na-traffic lang yun sa malalanding tao.",
  "Hindi lahat ng patama tungkol sa’yo, sadyang natatamaan ka lang kasi!",
  "Ang daling matulog, ang hirap bumangon. Ang daling mahulog, ang hirap mag move on.",

  // Newly merged quotes (latest batch you added)
  "Hindi lahat ng gusto mo, makukuha mo.",
  "Pagdating sa pag-ibig, dapat handa ka sa posibilidad ng pagkakamali.",
  "Hindi lahat ng pangako ay natutupad, pero kailangan pa rin natin magtiwala.",
  "Kung may dahilan kung bakit hindi kayo pwede, dapat may dahilan din kung bakit kayo pwede.",
  "Ang sakit ng kailangan mong i-let go ang taong mahal mo.",
  "Ang pag-ibig ay parang laro, may nanalo, may natatalo.",
  "Kung hindi kayo para sa isa't isa, dapat malaman ninyong pareho para di na kayo magkulang pa.",
  "Hindi lahat ng pag-ibig ay nagtatagal, pero kung talagang mahal mo ang isang tao, dapat kayong magtulungan para magtagal.",
  "Sa mundo ng pag-ibig, walang rules, walang assurance, walang dapat mong asahan.",
  "Hindi lahat ng tao, pinapahalagahan ang pag-ibig.",
  "Hindi mo kailangang magpakatanga para lang mahalin.",
  "Mas masarap ang magmahal kapag alam mong mahal ka rin.",
  "Hindi ka man naging sila, pero sa puso mo sila pa rin.",
  "Ang pinakamasakit na parte ng pag-ibig ay yung alam mong masaya na siya kahit wala ka na sa kanyang buhay.",
  "Hindi lahat ng hugot ay tungkol sa pag-ibig.",
  "Sa pag-ibig, dapat may respeto at pagpapahalaga.",
  "Hindi porket masaya ka, dapat lahat masaya.",
  "Hindi lahat ng tao na mahal mo ay para sa iyo.",
  "Kung mahal mo talaga, kaya mong maghintay.",
  "Sa pag-ibig, dapat handa ka sa posibilidad na masaktan ka.",
  "Kung mahal mo, kailangan mo ring magpaka-totoo.",
  "Mahal mo man o hindi, dapat mong tanggapin ang katotohanan.",
  "Sa pag-ibig, hindi ka laging magiging priority.",
  "Minsan, kailangan mong magpaka-strong para sa sarili mo.",
  "Hindi ka man bagay sa kanya, pero sa iba ay baka mag-fit ka.",
  "Sa pag-ibig, kailangan ng effort at compromise.",
  "Kung hindi ka mahal ng taong mahal mo, wag ka magtiwala na mahal ka niya.",
  "Ang love parang bayad sa jeep, minsan hindi mo namamalayan, nasobrahan ka na pala.",
  "Hindi porket umiwas ako, hindi na kita mahal. Mahal kita, pero mahal ko rin ang sarili ko.",
  "Kapag mahal mo, laging handa kang magpakatanga.",
  "Ang pinakamasakit na breakup ay yung hindi kayo, pero feeling mo kayo.",
  "Masakit mawalan ng taong mahal mo, pero mas masakit mawalan ng sarili mo para sa kanya.",
  "Ang love hindi nauubos, nagmamahal lang ng iba.",
  "Huwag mong hayaang magtiis ang puso mo sa taong hindi ka naman kayang mahalin ng buo.",
  "Minsan ang taong akala mo sasalo sa'yo, siya pa ang magpapabagsak sa'yo.",
  "Kapag pinagbigyan mo ang lahat ng hiling ng mahal mo, baka naman sa huli, wala ka na ring matira para sa sarili mo.",
  "Kapag mahal mo ang isang tao, kaya mong ibigay ang lahat-lahat para sa kanya, kahit pa ang sarili mo.",
  "Hindi lahat ng tao sa buhay mo ay para sa'yo, kaya kailangan mong magpaka-inteligente at magpaka-mature.",
  "Kapag iniwan ka ng taong mahal mo, wag mong hingin ang dahilan kung bakit, dahil minsan, wala naman talagang dahilan.",
  "Mahal ko siya, pero hindi niya ako mahal. Masakit man, pero kailangan kong mag-move on.",
  "Kapag mahal mo ang isang tao, kailangan mo ring tanggapin ang kanyang mga pagkukulang at hindi lang ang mga kabutihan niya.",
  "Ang mga mata mo, parang cellphone load lang yan, kailangan mong mag-iingat sa paggamit dahil hindi ito unlimited.",
  "Kapag hindi ka mahal ng taong mahal mo, wag mong ipagpilitan ang sarili mo sa kanya.",
  "Mahal ko siya pero hindi na ko magpapakatanga pa sa kanya. Mas mahalaga na ang pagmamahal sa sarili ko.",
  "Ang pag-ibig ay parang sugal, hindi mo alam kung mananalo ka o matalo.",
  "Kapag nagmahal ka, dapat handa kang masaktan. Pero wag mo naman sanang ipagkait sa sarili mo ang pagkakataon na magmahal.",
  "Hindi lahat ng tao sa paligid mo ay totoo, kaya mag-ingat ka sa pagtitiwala.",
  "Kung mahal ka ng taong mahal mo, hindi mo na kailangan pang magpakatanga para sa kanya.",
  "Ang love parang math, kung hindi mo maintindihan, wag mo nang pilitin.",
  "Hindi lahat ng relasyon, dapat ipilit. May mga bagay talaga na hindi dapat pinipilit.",
  "Mas mahirap magmahal ng taong hindi nagpapakita ng pagmamahal sayo.",
  "Masakit maging pangalawa sa puso ng taong mahal mo.",
  "Ang puso ko ay nag-iisa, naghihintay ng taong magmamahal nang totoo.",
  "Kapag wala na, dun mo pa lang malalaman kung gaano siya kahalaga sa buhay mo.",
  "Hindi mo kailangang magpakatanga sa pag-ibig, dahil hindi yun ang tunay na pagmamahal.",
  "Mas maganda pang maging single kaysa maging miserable sa isang relasyon.",
  "Masakit kapag ikaw yung nagmamahal nang sobra, pero hindi ka naman pinapahalagahan.",
  "Kung mahal mo ang isang tao, bakit hindi mo siya ipaglaban?",
  "Kung hindi ka na masaya, huwag kang magpakatanga. Maraming ibang tao sa mundo na magmamahal sayo nang totoo.",
  "Ang sakit kapag ikaw yung iniiwan. Pero mas masakit kapag ikaw yung umaalis, pero hindi mo gusto.",
  "Hindi lahat ng pangako, dapat pinaniniwalaan. Kailangan mo ring mag-isip nang mabuti.",
  "Ang pinakamasakit na part sa pag-ibig, ay ang magmahal ng taong hindi ka kayang mahalin.",
  "Kung hindi ka masaya, huwag kang magpakasaya para lang sa kanya. Dahil hindi yun tunay na pagmamahal.",
  "Kapag nagmahal ka, huwag kang matakot magpakatotoo. Kailangan ng tao ng totoo at walang halong kasinungalingan.",
  "Sa pag-ibig, hindi sapat ang pagmamahal lang. Kailangan mo rin ng respeto at tiwala.",
  "Kapag may mahal ka, dapat mong alagaan at pahalagahan. Dahil hindi lahat ng pag-ibig, ibinibigay ng libre.",
  "Hindi lahat ng bagay, pwede mong makuha. Kailangan mo rin ng tiyaga at paghihirap.",
  "Kapag hindi ka na mahal ng taong mahal mo, mas mabuti nang magpaka-tanga sa umpisa pa lang.",
  "Masakit man, kailangan mong tanggapin na hindi kayo para sa isa't isa.",
  "Ang love parang laro, kung hindi ka marunong maglaro, hindi ka rin mananalo.",
  "Kapag mahal mo ang isang tao, dapat mong alamin kung anong kailangan niya. Hindi yung ikaw lang lagi ang nakikinabang.",
  "Sa pag-ibig, dapat walang tinatago. Kailangan ng tao ng transparency at honesty.",
  "Ang puso ko'y nagdurusa sa sobrang pagmamahal sa'yo.",
  "Walang magbabago kung hindi mo aaminin ang totoo sa sarili mo.",
  "Hindi lahat ng nakikita mo ay totoo, lalo na sa mga taong nasa paligid mo.",
  "Bakit ba ang hirap magmahal ng taong hindi ka naman kayang mahalin?",
  "Sana hindi mo na lang sinabi kung hindi mo rin naman pala kayang panindigan.",
  "Ang pag-ibig ay parang isang laro, hindi mo alam kung sino ang mananalo at mawawala.",
  "Minsan, kahit gaano mo kamahal ang isang tao, hindi pa rin sapat.",
  "Mahirap mag-move on kapag hindi mo pa rin kayang bitawan ang kahapon.",
  "Sana hindi na lang tayo nagtagpo kung alam mong magiging ganito lang ang ending.",
  "Nagpakatanga ako dahil sa'yo, pero ngayon alam kong hindi naman ako importante sa'yo.",
  "Hindi ko na alam kung saan ako lulugar kasi hindi ko na alam kung saan ako nagkulang.",
  "Hindi lahat ng tanong may sagot, lalo na kung tungkol sa pag-ibig.",
  "Ang pagmamahal ay hindi dapat pilitin, dahil darating at darating 'yon kung para sa'yo.",
  "Ang mga pangarap ko, lahat ng ito ay para sa'yo. Pero hindi ko alam kung gusto mo rin ba ako.",
  "Nakakapagod din naman maging magalang at maalaga sa taong hindi naman nagbibigay ng halaga sa'yo.",
  "Sana hindi na lang tayo nag-umpisang magkaibigan kung alam mong magiging masakit lang sa'kin.",
  "Hindi lahat ng pagkakamali ay dapat pinaparusahan, lalo na kung ang pagkakamali mo ay magmahal ng sobra.",
  "Napapagod na ako sa paulit-ulit na pag-asa sa taong hindi naman nagbibigay ng halaga sa'kin.",
  "Masakit isipin na ang taong pinakamamahal mo ay hindi naman pala para sa'yo.",
  "Kahit gaano mo pa kamahal ang isang tao, kung hindi ka naman kayang mahalin, wala ring kwenta.",
  "Minsan, hindi mo alam na mahal mo na pala ang isang tao hanggang sa wala na siya sa'yo.",
  "Hindi mo maaaring mahalin ang isang tao nang sobra-sobra, dahil sa bandang huli, ikaw rin ang masasaktan.",
  "Hindi ko alam kung paano ko maiiwasan na mahalin ka pa rin kahit hindi ka naman para sa'kin.",
  "Ang pagmamahal ay hindi dapat pinipilit, dahil kung hindi para sa'yo, hindi talaga para sa'yo.",

  // Latest additional batch you asked to add (kept original order, duplicates removed)
  "Lahat tayo napapagod. Wag mong hintayin na mawala pa siya sa buhay mo bago mo siya pahalagahan.",
  "Yung naghihintay ka sa isang bagay na imposible namang mangyari.",
  "Masakit isipin na dahil sa isang pangyayari hindi na kayo pwedeng maging tulad ng dati.",
  "Yung akala mo minahal ka niya pero hindi pala.",
  "Sana tinuruan mo ‘ko kung paano madaling makalimot tulad ng ginawa mong paglimot sa’kin.",
  "Buti pa ang ngipin nabubunot kapag masakit. Sa ang puso ganun din.",
  "Umiiyak ka na naman? I-break mo na kasi!",
  "Ayaw ko nang magmahal masasaktan lang ulet ako.",
  "Di magatatagal yan! Lahat kaya may hangganan.",
  "Di naman siya mahal niyan. Assuming lang talaga yan!",
  "Ba’t naman sinagot mo? Lolokohin ka lang niyan!",
  "Naku po hindi ka nyan mahal! Piniperahan ka lang niyan!",
  "Niloloko ka na ang saya mo pa? Binobola ka na lang nyan nagpapaloko ka naman! Tsk!",
  "Sus! Walang poreber uy! Maghihiwalay lang din kayo. (Advance ako mag-isip eh!)",
  "Hindi ba sila nahihiya? Can they have some privacy? PDA pa more!",
  "Yan panay kasi FB bagsak ka tuloy. Break mo na yan!",
  "Yikes! Makapaglandian to the highest level! Di na nahiya!",
  "Gawing mong posible ang imposible. Kumilos kung gusto mong mangyare, ganun lang ka simple.",
  "Tatlong salita lang ang kailangan mo para sa buhay kahit gaano kahirap: It Goes On.",
  "Alam ko marami akong naging pagkakamali sa buhay ko, pero salamat LORD kasi hindi mo ako pinabayaan at hinding-hindi mo ako iniwan.",
  "Nararapat lamang na mahalin ang tao at gamitin ang mga bagay, at wag na wag mong gagamitin ang tao dahil mahal mo ang mga bagay.",
  "Wag kang mag-alala kung sa tingin mo maraming naninira sayo, isipin mo na lang na sadyang INGGIT lang sila sa kung anong narating mo.",
  "Nalaman kong habang lumalaki ka, maraming beses kang madadapa. Bumangon ka man ulit o hindi, magpapatuloy ang buhay, iikot ang mundo, at mauubos ang oras.",
  "Wag kang matakot magkamali. Walang mawawala kung di ka magbabakasakali.",
  "Lahat ng PROBLEMA, may SOLUSYON, kaya SMILE lang.",
  "Ang buhay ay parang Adidas at Nike lang… “Nothing is impossible” so “Just Do It”.",
  "Ang buhay, parang gulong, minsan nasa itaas ka, minsan naman ay nasa ilalim.",
  "Walang mangyayari sa buhay natin kung papairalin ang hiya at takot sa paggawa ng mga bagay na kaya naman nating gawin.",
  "Lagi mong tandaan kahit gaano pa ka USELESS ang tingin mo sa sarili mo, isa ka pa rin sa mga rason kung bakit may mga masayang tao.",
  "Matuto kang PUMIKIT ng hindi MAINGGIT. Hindi yung lait ka ng lait.",
  "Lahat tayo ay may problema, pagandahan na lang ng pagdadala.",
  "Kapag hinusgahan ka nila, Hayaan mo sila! Gawin mo na lang itong inspirasyon para maging mas matatag ka.",
  "Ang pinakamalaking pagkakamali na maaaring gawin ng isang tao, ay ang patuloy na isipin na gagawa siya ng mali.",
  "Kapag nadapa ka, Bumangon ka! Tandaan mo, May pagkakataon ka pa para ipakita sa kanila na hindi sa lahat ng pagkakataon, TAMA sila!",
  "Wag mong sanayin ang sarili mo sa pagsisinungaling, kasi baka dumting yung araw na ikaw mismo sa sarili mo di ka na naniniwala.",
  "Hndi dapat laging nagmamadali, dahil lahat ay may tamang panahon. Ang mga bagay na madaling makuha ay ang mga bagay na madali ding mawala.",
  "Sa mundong ito, gumawa ka man ng mabuti o masama may ipupuna sila. So do what makes you happy!",
  "Lahat ng bagay, pinaghihirapan. ‘Di matamis ang tagumpay kapag walang paghihirap na naranasan.",
  "Kung wala kang nagagawa sa kinatatayuan mo ngayon, wala ka ring magagawa sa kung saan mo man gusto pumunta.",
  "Wag kang magpapaapekto sa sinasabi ng iba, tuloy lang ang buhay.",
  "Magpahinga kung kelangan, pero wag kang susuko.",
  "Hindi ako nagbago. Natututo lang ako. Hindi kasi pwedeng habambuhay tanga tayo.",
  "Hindi mo kailangang magpakita ng pusod at hindi mo kailangang naka-todo make up. Dahil ang tunay na maganda, ngiti palang, pamatay na.",
  "Hindi mo kailangan makipagsabayan sa iba para masabing gwapo ka. Dahil ang tunay na gwapo, ugali muna ang inaayos bago ang itsura.",
  "Wag kang mag-alala kung sa tingin mo maraming naninira sa’yo. Isipin mo na lang na sadyang inggit sila sa kung anong narating mo.",
  "Hindi lahat ng tahimik ay nasa loob ang kulo. Sila kasi yung tipo ng tao na marunong mag-isip bago muna kumibo.",
  "Kung normal kang tao dapat aware ka sa nararamdaman ng iba. Kapag alam mong nakakasakit ka na, titigil ka na.",
  "Ang tunay na kaibigan, magalit man hindi nangbubunyag ng sekreto yan.",
  "Ang pagkakaibigan hindi nasusukat sa haba ng pinagsamahan kundi sa mga panahong hinding-hindi ka iiwan kapag kailangan.",
  "Hindi sa lahat ng pagkakataon BAD INFLUENCE ang TROPA! Sadyang may mga bagay lang na masarap gawin kapag sila ang KASAMA.",
  "Ang mga KAIBIGAN ay parang mga prutas. May dalawang klase yan, ang SEASONAL at FOR ALL SEASONS.",
  "Ang tunay na kaibigan, mas bitter pa sayo kapag nalamang sinaktan ka ng taong mahal mo.",
  "Hindi lahat ng kaibigan, dapat pinapayuhan. Minsan kailangan mo lang silang batukan para matauhan.",
  "Ang tunay na kaibigan kahit busog pa yan, pag nanglibre ka, kakain at kakain yan.",
  "Ang tunay na kaibigan ay hindi nagagalit kapag ininsulto mo. Sa halip ay mag-iisip sila ng mas nakaka-insultong salita na ibabato sayo.",
  "Ang tunay na kaibigan ay parang magnet. Didikit sa bakal pero hindi sa plastik.",
  "Ang tunay na kaibigan ay alam na alam kung paano ka sisirain pero hinding-hindi niya gagawin.",
  "Lahat naman tayo dumadaan sa problema. Pero dapat dumaan ka lang, wag kang tumambay.",
  "Wag mo hayaang sumasabay ka lang sa agos ng dagat, minsan, dapat ikaw mismo ang kokontrol ng direksyon nito.",
  "Kung lahat ng makakaya mo ay iyong ibinibigay, tagumpay mo’y walang kapantay.",
  "Hindi mahalaga kung gaano ka katagal nabuhay, ang mahalaga ay kung paano ka nabuhay.",
  "Ang negatibong tao ay nakakakita ng problema sa bawat pagkakataon. Ang positibong tao ay nakikita ang pagkakataon sa bawat problema.",
  "Wag kang matakot na maging ikaw. Tandaan mo: ang pagiging orig ay mas maganda kaysa sa fake.",
  "Hindi mo na kailangan ng ibang tao para magkusa ka, kung gusto mo talagang magtagumpay, sapat na yung ikaw mismo ang magkusa para sa ikabubuti mo.",
  "Ang mga taong agad sumusuko ay hindi nananalo. Ang mga taong laging panalo ay hindi kailan man sumusuko.",
  "Lahat ng problema nasusulusyunan, kailangan mo lang tumayo at harapin yung mga bagay na dapat dati mo pa hinarap.",
  "“Tapusin ang dapat tapusin nang may masimulan namang bago.” —Eros S. Atalia",
  "Ang bawat kabiguan sa buhay ay paraan para patuloy kang magpursigi kahit na sa tingin mo naabot mo na lahat ng yong mga pangarap.",
  "Ang tunay na sikreto sa tagumpay ay pagsisikap at patuloy na pagbangon sa bawat pagkakamali.",
  "Huwag kang malungkot kapag may pagsubok, dahil pagkatapos nito ay may tagumpay.",
  "Ang pagkabigo ginagamit yan para matuto hindi para muling magpauto.",
  "Kapag may problema, iiyak mo lang tapos tama na. Punas luha. Ayos damit. Suklay buhok. Tapos smile. Tuloy ang ikot ng mundo.",
  "Ang tagumpay ay hindi nasusukat sa dami ng karangalan na iyong natamo, kundi sa dami ng pagsubok na iyong nalalagpasan sa araw-araw.",
  "Lahat kaya mong abutin kung magtitiwala ka sa sarili mong kakayahan.",
  "Lahat tayo ay may problema, pagandahan na lang ng pagdadala. Lahat ng problema, may solusyon, kaya smile lang.",
  "Lagi mong tandaan kahit gaano pa ka useless ang tingin mo sa sarili mo, isa ka pa rin sa mga rason kung bakit may mga masayang tao.",
  "Kapag hinusgahan ka nila, hayaan mo sila! Gawin mo na lang itong inspirasyon para maging mas matatag ka.",
  "Kapag nadapa ka, bumangon ka! Tandaan mo, may pagkakataon ka pa para ipakita sa kanila na hindi sa lahat ng pagkakataon, tama sila!",
  "Hindi dapat laging nagmamadali, dahil lahat ay may tamang panahon. Ang mga bagay na madaling makuha ay ang mga bagay na madali ding mawala.",
  "Hindi mawawala sa buhay ng tao ang masaktan. Dahil dyan ka magiging matatag at matututo sa mga bagay-bagay.",
  "Pahalagahan mo ang pamilyang meron ka dahil hindi sa lahat ng pagkakataon ay nariyan sila.",
  "Ipagpasalamat sa Diyos ang iyong pamilya.",
  "Sa panahon ng kagipitan, may pamilya kang masasandalan.",
  "Ipagtanggol ang dangal iyong pamilya sa abot ng iyong makakaya.",
  "ABROAD. Salitang masarap pakinggan pero dyan mo din mararanasan ang paghihirap na di mo inaasahan.",
  "Ang aking anak ang syang dahilan bakit ako nakipagsasapalaran sa ibang bansa. Para mabigyan ko siya ng magandang kinabukasan.",
  "Pagod at hirap na kaming magtrabaho dito sa abroad! Ang pamilya pa ang nagtatanong bakit wala ka naipon?",
  "Kapag nasa abroad akala nila ang dami mong pera. Ang di nila alam resibo na lang ang nasa iyo tapos yung kamay mo pa puro kalyo.",
  "Hindi lahat ng OFW mayaman. Yung iba kasi inuuna yung yabang at nagmamayaman lang.",
  "Kapag umuwi ang OFW wag ka agad mag-expect ng pasalubong. Bakit nung umalis ba sila may hiningi sila sa’yo?",
  "Hindi ATM o money transfer ang OFW na lalapitan mo lang pag may kailangan ka.",
  "Walang salitang PAGOD NA AKO sa isang magulang na OFW. Basta para sa kinabukasan nang ANAK lahat kinakaya gaano man kahirap.",
  "Babuti pa ang salary buwan-buwan umuwi sa pamilya. Samantalang ang nagtattabaho aboad minsanan lang umuwi.",
  "Nag-abroad ka para guminhawa ang buhay ng iyong pamilya hindi para magkaroon ng ibang pamilya!",
  "Congrats nga pala sa career mong wagi. Good luck na lang sa lovelife mong sawi.",
  "Bakit pag umiinom tayo ng isang basong tubig parang ang hirap? Pero pag umiinom tayo ng redhorse kahit isang case parang kulang pa? Bakit ganon?",
  "Wala naman talagang taong panget. Nagkataon lang na ang mukha nila ay di pa uso sa panahon ngayon.",
  "Bakit pag late ka, pumapasok yung prof mo? Pero pag hindi ka late wala naman yung prof mo? Bakit ganon? Unfair!!!!!",
  "Nakakainis kayo lagi niyo na lang ako tinatapakan. Hindi na ba magbabago ang pagtingin niyo sakin? —Doormat",
  "Kapag mahal na araw, wag kang lalabas ng bahay. Baka may masalubong kang pusang itim, mamalasin ka! Advance ako magisip.",
  "Sinabihan ka lang ng maganda, naniwala ka naman? Mangungutang lang yan!",
  "Yung ugali, hindi required iterno sa mukha. Kung panget mukha mo, pwede bang gandahan mo naman ugali mo?",
  "Pag nagka amnesia ang bakla, makakalimutan ba niyang bading siya?",
  "Na-Columbia Kala mo sa’yo yun pala hindi.",
  "Mahirap magpaalam sa taong mahal mo, pero mas mahirap magpaalam pag galit ang nanay mo.",
  "Kamote. Minsan halaman, minsan ikaw!",
  "Simple lang naman ang paraan para hindi ka na mahirapan sa job interview: Wag kang mag apply! Diyan ka na lang sa bahay at maging palamunin ni nanay.",
  "Dati ang magaganda pinagkakaguluhan ng mga lalaki. Ngayon ang magaganda kinikilatis muna. Baka kasi BEKI!",
  "Kapag may gusto ka sa isang tao, dapat sabihin mo na habang maaga pa. Kasi pag gabi na tulog na yun!",
  "Feel na feel i-post yung picture niya sa harap ng salamin sa CR. Anong gusto mong iparating? Na pretty ka pa rin pagkatapos mong jumebs???",
  "Yung katawan ang tindi ng alindog. Pero yung mukha nakakausog!",
  "Ang common sense minsan parang deodorant; kung sino pa yung mas higit na nangangailangan, sila pa ang hindi gumagamit.",
  "Mahirap talaga pag Linggo ko lang o kaya isang araw lang ang pahinga. Pag nagpahinga ka kasi iisipin mo hindi ka man lang nakapasyal. Pag namasyal ka naman, iisipin mo hindi ka man lang nakapahinga.",
  "…"
];


  const hugotAuthors = [
    "Hugot", "Pag-ibig", "Broken", "Heartbreak", "Hugot Lines",
    "Pinoy Hugot", "Love Quotes", "Sad Quotes", "Tagalog Quotes", "Bitter"
  ];

  const apiUrl = `/api/bundled-font-overlay?image=https://picsum.photos/800/600&title=${encodeURIComponent(title)}&website=${encodeURIComponent(website)}&design=${design}&w=1080&h=1350&_t=${refreshKey}`;

  const loadRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    setTitle(inspirationalQuotes[randomIndex]);
    setWebsite(authors[randomIndex]);
    setRefreshKey(Date.now()); // Update refresh key to bust cache
  };

  const loadRandomTagalogQuote = () => {
    const randomIndex = Math.floor(Math.random() * tagalogQuotes.length);
    setTitle(tagalogQuotes[randomIndex]);
    setWebsite(tagalogAuthors[randomIndex]);
    setRefreshKey(Date.now()); // Update refresh key to bust cache
  };

  const loadRandomHugotQuote = () => {
    const randomIndex = Math.floor(Math.random() * hugotQuotes.length);
    setTitle(hugotQuotes[randomIndex]);
    setWebsite(hugotAuthors[randomIndex % hugotAuthors.length]);
    setRefreshKey(Date.now()); // Update refresh key to bust cache
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>🎯 Quote Overlay Design Testing</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Test the new quote overlay designs that center text on the entire image with black backgrounds
      </p>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>🎨 Design Controls</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Quote Text:
              </label>
              <textarea 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '80px', 
                  padding: '10px', 
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Enter your inspirational quote..."
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Author/Source:
              </label>
              <input 
                type="text" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
                placeholder="Author or source name..."
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
              Quote Design Style:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {Object.entries(quoteDesigns).map(([key, name]) => (
                <label key={key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '10px',
                  border: design === key ? '2px solid #007cba' : '2px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: design === key ? '#f0f8ff' : 'white',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="radio" 
                    value={key} 
                    checked={design === key}
                    onChange={(e) => setDesign(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '13px' }}>{name}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={loadRandomQuote}
              style={{
                backgroundColor: '#007cba',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                flex: 1
              }}
            >
              🎲 Load Random Inspirational Quote
            </button>

            <button 
              onClick={loadRandomTagalogQuote}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                flex: 1
              }}
            >
              🇵🇭 Mag-load ng Random na Inspirational Quote Tagalog
            </button>

            <button 
              onClick={loadRandomHugotQuote}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                flex: 1
              }}
            >
              💔 Mag-load ng Random na Hugot Quotes Tagalog
            </button>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>📸 Generated Quote Image</h3>
          
          <div style={{ 
            border: '3px solid #ddd', 
            borderRadius: '10px', 
            overflow: 'hidden',
            backgroundColor: '#f8f8f8',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={apiUrl} 
              alt="Quote overlay preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '600px',
                height: 'auto',
                borderRadius: '5px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              onError={(e) => {
                e.target.alt = "⚠️ Error loading image. Check console logs.";
                e.target.style.background = "#ffe6e6";
                e.target.style.color = "#d63384";
                e.target.style.textAlign = "center";
                e.target.style.padding = "40px";
                e.target.style.border = "2px dashed #d63384";
              }}
            />
          </div>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <strong>API URL:</strong>
            <br />
            <code style={{ 
              fontSize: '11px', 
              wordBreak: 'break-all',
              backgroundColor: 'white',
              padding: '5px',
              borderRadius: '3px',
              border: '1px solid #ddd',
              display: 'block',
              marginTop: '5px'
            }}>
              {apiUrl}
            </code>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333' }}>✨ Quote Design Features</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>🎯 Centered Text:</strong> Text is positioned in the center of the image instead of bottom</li>
            <li><strong>🖤 Full Image Overlay:</strong> Black/dark background covers the entire image</li>
            <li><strong>🔤 Bold Typography:</strong> Uses the boldest fonts (Anton, Playfair Display, Impact)</li>
            <li><strong>📱 Perfect for Social Media:</strong> Great for Instagram quotes, motivational posts</li>
            <li><strong>🎨 Three Variations:</strong> 
              <ul style={{ marginTop: '8px' }}>
                <li><code>quote1</code>: Pure black background with Anton font (most bold)</li>
                <li><code>quote2</code>: Dark charcoal with elegant Playfair Display</li>
                <li><code>quote3</code>: Gradient black with Impact font for maximum impact</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}