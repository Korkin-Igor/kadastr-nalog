import analyticsIcon from '@/assets/icons/analytics.svg';
import articleIcon from '@/assets/icons/article.svg';
import bellIcon from '@/assets/icons/bell.svg';
import briefcaseIcon from '@/assets/icons/briefcase.svg';
import chartIcon from '@/assets/icons/chart.svg';
import documentIcon from '@/assets/icons/document.svg';
import gavelIcon from '@/assets/icons/gavel.svg';
import homeIcon from '@/assets/icons/home.svg';
import mailIcon from '@/assets/icons/mail.svg';
import menuIcon from '@/assets/icons/menu.svg';
import schoolIcon from '@/assets/icons/school.svg';
import searchIcon from '@/assets/icons/search.svg';
import shieldIcon from '@/assets/icons/shield.svg';
import trendIcon from '@/assets/icons/trend.svg';
import verifiedIcon from '@/assets/icons/verified.svg';
import logo from '@/assets/icons/logo.svg';
import socialMaxIcon from '@/assets/icons/social/max.svg';
import socialTenchatIcon from '@/assets/icons/social/tenchat.svg';
import socialVkIcon from '@/assets/icons/social/vk.svg';
import ideaImage from '@/assets/images/idea-photo.png';
import reviewBetonMssImage from '@/assets/images/reviews/image1.jpeg';
import reviewGoyaevImage from '@/assets/images/reviews/image2.jpeg';
import reviewAquaExpressImage from '@/assets/images/reviews/image3.png';
import reviewArmavirTppImage from '@/assets/images/reviews/image4.png';
import reviewSelektsionnayaImage from '@/assets/images/reviews/image5.jpeg';
import reviewEdelweissImage from '@/assets/images/reviews/image6.jpeg';
import reviewAngorizontImage from '@/assets/images/reviews/image7.jpeg';
import reviewDelfinariyImage from '@/assets/images/reviews/image8.jpeg';
import reviewPolyakovImage from '@/assets/images/reviews/image9.jpeg';
import reviewApartsHotelImage from '@/assets/images/reviews/image10.jpeg';
import reviewShamsImage from '@/assets/images/reviews/image11.jpeg';
import reviewPyatigorskayaImage from '@/assets/images/reviews/image12.png';
import reviewNashDomImage from '@/assets/images/reviews/image13.gif';
import reviewKaridentImage from '@/assets/images/reviews/image14.jpeg';
import reviewKongressImage from '@/assets/images/reviews/image15.jpeg';
import reviewGorizontLokImage from '@/assets/images/reviews/image16.png';
import reviewLagoNakiImage from '@/assets/images/reviews/image17.png';
import reviewUsmanImage from '@/assets/images/reviews/image18.jpeg';
import heroVideoSource from '@/assets/videos/video.mp4';

export const businessSectorOptions = [
  'Розничная торговля и коммерческая недвижимость',
  'Магазины – все виды торговли',
  'Торговые центры',
  'Промышленность',
  'Производство',
  'Заводы',
  'Склады',
  'Производственные помещения',
  'Офисы',
  'Бизнес-центры',
  'Логистика и дистрибуция',
  'Склады и логистические центры — капиталоёмкие объекты',
  'Пансионаты и санатории',
  'Ресторанный бизнес',
  'Гостевые дома и хостелы',
  'Сельское хозяйство',
  'Агробизнес',
  'Мойки, автосалоны, сто',
  'Гостиницы, гостевые дома, отели',
  'Рестораны, кафе, бары, столовые, банкетные залы',
  'Торговля на складах',
  'ИЖС - квартиры, дома, земля',
  'Имущество сферы бытового обслуживания',
  'Салоны красоты и бьюти-сфера',
  'Фитнес клубы и спорт',
  'Строительная сфера',
  'Услуги для детей',
  'Медицинские центры'
];

const defaultLeadFormUiText = {
  backLinkLabel: 'Назад к сервисам',
  backLinkHref: '/#useful',
  submittingLabel: 'Отправка...',
  requiredSelectMessage: 'Выберите значение из списка.',
  requiredFieldMessage: 'Заполните поле.',
  phoneIncompleteMessage: 'Введите номер телефона полностью.',
  emailInvalidMessage: 'Введите email в формате name@example.com.',
  cadastralInvalidMessage: 'Формат: 00:00:0000000:00',
  submitFailedMessage: 'Не удалось отправить заявку. Попробуйте позже.',
  networkFailedMessage: 'Ошибка соединения с сервером.'
};

export const defaultLandingPageData = {
  brand: {
    title: 'Центр налоговой аналитики недвижимости',
    logo
  },
  navigation: [
    { id: 'hero', label: 'Главное' },
    { id: 'ideas', label: 'Три идеи' },
    { id: 'offer', label: 'Что мы предлагаем' },
    { id: 'free-services', label: 'Бесплатные сервисы' },
    { id: 'checklist', label: 'Чек-лист' },
    { id: 'audit', label: 'Что можно проверить' },
    { id: 'important', label: 'Важно знать' },
    { id: 'useful', label: 'Полезные сервисы' },
    { id: 'reviews', label: 'Отзывы' }
  ],
  headerContent: {
    menuLabel: 'Меню',
    navigationLabel: 'Навигация по разделам',
    navigationTitle: 'Навигация',
    closeMenuLabel: 'Закрыть',
    closeMenuAriaLabel: 'Закрыть меню',
    utilityHref: '#checklist'
  },
  heroContent: {
    eyebrow: 'Экспертиза для собственников и управляющих недвижимостью',
    titleLines: ['Сервис управления', 'налоговыми', 'рисками в', 'недвижимости'],
    accentWord: 'рисками',
    description:
      'Мы помогаем снижать налоговые риски при владении, управлении и сделках с объектами недвижимости.',
    proofPoints: [
      'Подтвержденная экспертиза в контуре недвижимости',
      'Фокус только на рисках в контуре недвижимости',
      'Сайт сразу считывается как площадка для серьезных собственников'
    ],
    cta: 'Проверить возможность снизить налоговые риски',
    utilityLabel: 'проверить возможность снизить налоговые риски',
    menuIcon,
    videoSrc: heroVideoSource,
    videoLabel: 'Видео-презентация',
    videoDialogTitle: 'Видео-презентация',
    previewAriaLabel: 'Превью видео-презентации сервиса',
    openVideoAriaLabel: 'Открыть видео',
    closeVideoLabel: 'Закрыть',
    closeVideoAriaLabel: 'Закрыть видео',
    watchLabel: 'Смотреть',
    pauseLabel: 'Пауза',
    mutedButtonLabel: 'Звук выкл',
    unmutedButtonLabel: 'Звук вкл',
    videoRangeLabel: 'Позиция видео'
  },
  ideaSection: {
    title: 'Три главные идеи нашего проекта',
    description: '',
    note:
      'Собственники привыкли управлять доходностью, но часто игнорируют налоговый риск. Мы закрываем этот пробел.',
    image: ideaImage,
    imageAlt: 'Иллюстрация к идеям проекта',
    items: [
      'Недвижимость — главный актив бизнеса и семьи',
      'Государственная переоценка влияет на стоимость владения и размер налога',
      'Мы — инструмент защиты капитала на долгие годы'
    ]
  },
  offerMeta: {
    title: 'Что мы можем предложить?',
    paragraphs: [
      'Мы помогаем владельцам недвижимости законно снизить налоговую нагрузку. Анализируем обязательства, находим способы оптимизации и сопровождаем собственников на всех этапах.',
      'Особое внимание уделяем снижению кадастровой стоимости, проверке объектов на долги и обременения, а также мониторингу налоговых изменений.',
      'Это позволяет клиентам экономить и минимизировать риски при управлении имуществом.'
    ]
  },
  offerCards: [
    {
      icon: analyticsIcon,
      titleHtml: 'Анализ <span>налоговых обязательств</span> и <span>рисков</span> по объектам недвижимости'
    },
    {
      icon: searchIcon,
      titleHtml: 'Проверка объектов на <span>скрытые налоговые задолженности и обременения</span>'
    },
    {
      icon: trendIcon,
      titleHtml: 'Рекомендации по <span>налоговой оптимизации</span> и минимизации рисков'
    },
    {
      icon: bellIcon,
      titleHtml: 'Мониторинг <span>изменений в налоговом законодательстве</span>, влияющих на недвижимость'
    },
    {
      icon: verifiedIcon,
      titleHtml: '<span>Поддержка и сопровождение</span> на всех этапах сделок и управления имуществом'
    }
  ],
  freeServicesSection: {
    title: 'Бесплатные сервисы'
  },
  freeServiceForms: [
    {
      icon: briefcaseIcon,
      title: 'Проверить возможность снизить налоговые риски в бизнесе',
      description:
        'Проверьте кадастровые данные до переоценки 2027 и защитите себя от завышенного налога на ближайшие 4 года.',
      submitLabel: 'Отправить заявку',
      successText: 'Заявка принята. Подготовим первичную оценку риска и свяжемся с вами.',
      formType: 'business_risk',
      actionUrl: 'form-handler.php',
      showBackLink: false,
      ...defaultLeadFormUiText,
      fields: [
        {
          name: 'cadastral',
          label: 'Кадастровый номер',
          type: 'cadastral',
          placeholder: 'XX:XX:XXXXXXX:XX',
          required: true
        },
        {
          name: 'phone',
          label: 'Телефон',
          type: 'tel',
          placeholder: '+7 (___) ___-__-__',
          required: true
        }
      ]
    },
    {
      icon: homeIcon,
      title: 'Проверить кадастровую стоимость недвижимости',
      description:
        'Проверьте корректность кадастровой стоимости вашего объекта и получите рекомендации по налоговым рискам.',
      submitLabel: 'Отправить заявку',
      successText: 'Заявка принята. Проверим объект и вернёмся с рекомендацией по следующему шагу.',
      formType: 'cadastral',
      actionUrl: 'form-handler.php',
      showBackLink: false,
      ...defaultLeadFormUiText,
      fields: [
        {
          name: 'cadastral',
          label: 'Кадастровый номер',
          type: 'cadastral',
          placeholder: 'XX:XX:XXXXXXX:XX',
          required: true
        },
        {
          name: 'phone',
          label: 'Телефон',
          type: 'tel',
          placeholder: '+7 (___) ___-__-__',
          required: true
        }
      ]
    }
  ],
  checklistContent: {
    eyebrow: 'Чек-лист по рискам',
    title: 'Проверьте возможность снизить налоговые риски в бизнесе',
    description:
      'Оцените ситуацию до переоценки 2027 года: чек-лист поможет понять, где искать завышение кадастровой стоимости и как сократить расходы до 30% уже сейчас',
    benefits: [
      {
        icon: analyticsIcon,
        text: '9 факторов, влияющих на кадастровую стоимость'
      },
      {
        icon: trendIcon,
        text: 'Что нужно обязательно сделать до 01.01.2027 г.'
      },
      {
        icon: verifiedIcon,
        text: 'Чек-лист пошаговых действий собственника для защиты'
      }
    ],
    note: 'Отправим чек-лист и поможем быстро оценить ситуацию без лишней бюрократии.',
    badge: 'Получить чек-лист',
    formTitle: 'Оставьте контакты и сферу бизнеса',
    formDescription:
      'Подскажем, где искать налоговые риски, и отправим структурированный чек-лист пошаговых действий.',
    fields: [
      {
        name: 'business',
        label: 'Сфера бизнеса',
        type: 'select',
        placeholder: 'Выберите сферу бизнеса',
        required: true,
        options: businessSectorOptions
      },
      {
        name: 'phone',
        label: 'Телефон',
        type: 'tel',
        placeholder: '+7 (___) ___-__-__',
        required: true
      }
    ],
    submitLabel: 'Получить чек-лист',
    successText: 'Чек-лист запросили. Отправим его и предложим первичную консультацию.',
    privacy: 'Контакты используем только для отправки чек-листа и первичной консультации.',
    noteIcon: shieldIcon,
    checkListIcon: articleIcon,
    formType: 'general',
    actionUrl: 'form-handler.php',
    showBackLink: false,
    ...defaultLeadFormUiText
  },
  dualSection: {
    title: 'Что можно проверить?',
    description: '',
    items: [
      'Корректность кадастровой стоимости (земля, здание, их соотношение)',
      'Возможность применения налоговых льгот',
      'Налоговые обязательства и возможные переплаты',
      'Переоценка и ее влияние на налоговую нагрузку',
      'Законность включения объекта в региональные перечни налогообложения',
      'Сквозные аналитические данные по налогам на имущество до 2030 года'
    ]
  },
  importantSection: {
    title: 'Важно знать!',
    lead:
      'Многие собственники совершают ошибки из-за незнания законов, актуальных правил пересмотра кадастровой стоимости и применения льгот.',
    body:
      'Игнорирование этих норм приводит к необоснованным переплатам и юридическим рискам для собственников. Поэтому мы вынесли самые критичные сигналы в отдельный компактный блок.',
    cards: [
      {
        icon: chartIcon,
        title: 'Ограничение роста налога',
        description:
          'Не торопитесь снижать кадастровую стоимость — налог не может превысить 10% ранее уплаченной суммы'
      },
      {
        icon: verifiedIcon,
        title: 'Право на налоговые льготы',
        description: 'Право на налоговые льготы по статье Налогового кодекса'
      },
      {
        icon: gavelIcon,
        title: 'Законность включения в региональные перечни',
        description: 'Проверяйте законность включения в региональные перечни налогообложения'
      }
    ]
  },
  usefulSection: {
    title: 'Полезные сервисы для собственников',
    description:
      'Сервисы собраны в аккуратный каталог: меньше декоративности, больше ясности и пользы для владельца.',
    cards: [
      {
        icon: analyticsIcon,
        title: 'Анализ и рекомендации по налоговой нагрузке на имущество на ближайшие 5 лет',
        description:
          'Строим прогноз налоговых рисков по объекту недвижимости на горизонте пяти лет с опорой на данные, практику и поведение налоговых органов.',
        to: '/services/risk-analysis'
      },
      {
        icon: documentIcon,
        title: 'Шаблоны документов для самостоятельного снижения налогов',
        description:
          'Готовые шаблоны заявлений, запросов и уведомлений, которые помогают законно оптимизировать налоговую нагрузку по недвижимости.',
        to: '/services/document-templates',
        featured: true,
        badge: 'Документы',
        ctaLabel: 'Открыть каталог'
      },
      {
        icon: articleIcon,
        title: 'Журнал с экспертными статьями по налогам и недвижимости',
        description:
          'Электронный журнал для собственников имущества с сильной прикладной аналитикой по налогам, недвижимости и стратегиям владения активами.',
        to: '/services/owners-journal'
      },
      {
        icon: mailIcon,
        title: 'Еженедельная рассылка новостей по налогам и недвижимости',
        description:
          'Сжатая подборка главных событий недели, изменений в законодательстве и практических советов без информационного шума.',
        to: '/services/newsletter'
      },
      {
        icon: schoolIcon,
        title: 'Обучение по налогу на имущество как система знаний',
        description:
          'Практическое обучение по налогу на имущество с повторяемой системой знаний, к которой можно возвращаться в ежедневной работе.',
        to: '/services/property-tax-training',
        featured: true,
        badge: 'Видео и аудио',
        ctaLabel: 'Выбрать формат'
      },
      {
        icon: gavelIcon,
        title:
          'Сбор подписей для законопроектов в Государственную Думу и обращений в Конституционный суд РФ',
        description:
          'Организованный и юридически корректный сбор подписей под инициативами, связанными с регулированием налоговых начислений от кадастровой стоимости.',
        to: '/services/signature-campaign'
      }
    ]
  },
  reviewsSection: {
    title: 'Отзывы и доверие к работе команды',
    previousAriaLabel: 'Предыдущий отзыв',
    previousHorizontalAriaLabel: 'Предыдущий отзыв слева',
    nextAriaLabel: 'Следующий отзыв',
    nextHorizontalAriaLabel: 'Следующий отзыв справа'
  },
  reviews: [
    {
      name: 'ООО "БЕТОН МСС", г. Новороссийск',
      text:
        'Работаем с ними уже не по первому объекту с 2015 года. Всегда чётко, в срок и с результатом. Помогли оптимизировать расходы по нескольким зданиям и участкам. Надёжные специалисты.',
      wide: false,
      image: reviewBetonMssImage
    },
    {
      name: 'ООО «Гояев Ренессанс Групп»',
      text:
        'От лица владельца коммерческого здания в г. Кисловодске могу сказать, что результат превзошёл ожидания. Провели грамотный анализ, подготовили все документы и добились существенного снижения кадастровой стоимости. Налоговая нагрузка заметно сократилась уже в первый год. Работа выполнена профессионально и без лишних сложностей для нас.',
      wide: true,
      image: reviewGoyaevImage
    },
    {
      name: 'Aqua Express, автомойка самообслуживания, г. Ессентуки',
      text:
        'Обратился за пересмотром стоимости земли. Результат полностью устроил. Специалисты грамотно подготовили документы и сопровождали процесс до конца. Экономия ощутимая.',
      wide: false,
      image: reviewAquaExpressImage
    },
    {
      name: 'Союз «Армавирская межрайонная ТПП»',
      text:
        'Специалисты проводили семинар для предпринимателей Союза «Армавирская межрайонная Торгово-промышленная палата» по вопросам государственной кадастровой оценки на территории Краснодарского края в 2023 году. Семинар оказался очень полезным: разобрали все нюансы государственной кадастровой оценки и оптимизации расходов. Сразу видно опыт работы с коммерческой недвижимостью и бизнесом.',
      wide: true,
      image: reviewArmavirTppImage
    },
    {
      name: 'Собственник, производственная база «Селекционная», г. Ставрополь',
      text:
        'Обращались за снижением кадастровой стоимости земельного участка неоднократно. Результат превзошёл ожидания: снизили почти на 40%. Существенно сократились налоговые платежи. Работа выполнена чётко и без лишних хлопот. Одно плохо: раз в 4 года при новой государственной кадастровой оценке кадастровая стоимость возрастает заново.',
      wide: true,
      image: reviewSelektsionnayaImage
    },
    {
      name: 'Гостиница «Эдельвейс», г. Невинномысск',
      text:
        'Сомневались, что получится снизить кадастровую стоимость, но результат превзошёл ожидания. Работают под ключ: от анализа до решения. Нам не пришлось вникать в юридические нюансы. По нашему объекту добились пересмотра и сократили налоговые платежи. Рекомендуем.',
      wide: true,
      image: reviewEdelweissImage
    },
    {
      name: 'Руководитель АН «Горизонт», г. Ставрополь',
      text:
        'Получили грамотную консультацию по оформлению и использованию коммерческой недвижимости. Объяснили риски и помогли выбрать оптимальную стратегию. Рекомендую.',
      wide: false,
      image: reviewAngorizontImage
    },
    {
      name: 'Собственник «Дельфинария», г. Кисловодск',
      text:
        'Работаем с 2018 года. Я владею дельфинарием в г. Кисловодске и долгое время платил завышенный налог. После пересмотра кадастровой стоимости и снижения налоговой ставки с 2% до 0,5% экономия на налогах стала четырёхкратной. Экономия ежегодно для нас существенная. Работа проведена грамотно и без лишней нагрузки на нас.',
      wide: true,
      image: reviewDelfinariyImage
    },
    {
      name: 'Собственник недвижимости Поляков Дмитрий, г. Ессентуки',
      text:
        'Долго платил завышенный налог на коммерческую недвижимость. После обращения провели анализ, подготовили документы и добились пересмотра стоимости. Экономия ощутимая уже в первый год. Рекомендую.',
      wide: false,
      image: reviewPolyakovImage
    },
    {
      name: 'Апартс Отель, г. Ессентуки',
      text:
        'Как владелец гостиницы, отмечаю высокий уровень профессионализма. Вопрос с кадастровой стоимостью решили быстро и грамотно, без лишней бюрократии. Существенно снизили налоговую нагрузку, что напрямую повлияло на прибыль.',
      wide: true,
      image: reviewApartsHotelImage
    },
    {
      name: 'Гостевой дом «Shams», г. Кисловодск',
      text:
        'Работа выполнена под ключ, практически без нашего участия. Команда взяла на себя все процессы и довела дело до результата. Для гостиничного бизнеса это особенно важно: не отвлекаться от операционной деятельности.',
      wide: true,
      image: reviewShamsImage
    },
    {
      name: 'Владелец здания, г. Ессентуки, ул. Пятигорская',
      text:
        'Обратился за снижением кадастровой стоимости помещений в коммерческом здании. Провели анализ, показали реальную переплату и предложили стратегию. В итоге налог снизился почти вдвое. Всё сделали без моего участия, регулярно информировали. Результат полностью оправдал ожидания.',
      wide: true,
      image: reviewPyatigorskayaImage
    },
    {
      name: 'Директор АНО «Наш дом», г. Новороссийск',
      text:
        'Благодарю сотрудников Центра налоговой аналитики недвижимости за организацию процесса пересмотра кадастровой стоимости помещения. Осенью 2025 года получил налог за 2024 год, в 2 раза превысивший прошлый. Не выходя на объект, чтобы убедиться, что помещение по факту находится в полуподвале без отопления, Роскадастр виртуально определил кадастровую стоимость, из-за чего прилетел налог выше, хотя уже 2 года это помещение не продаётся, несмотря на рекламу. Теперь проблема решена, платить за воздух не придётся.',
      wide: true,
      image: reviewNashDomImage
    },
    {
      name: 'Руководитель клиники «КариДент», г. Анапа',
      text:
        'Сначала сомневалась, что получится снизить налог. Специалисты рассчитали потенциал экономии и объяснили процесс простым языком. Через несколько месяцев получила решение в нашу пользу. Экономия ощутимая и уже в первый год перекрыла стоимость услуги.',
      wide: true,
      image: reviewKaridentImage
    },
    {
      name:
        'Почётный президент регионального объединения работодателей Ставропольского края «Конгресс деловых кругов Ставрополья» Травов Василий Павлович',
      text:
        'Профессиональный подход на всех этапах. Сначала сделали бесплатный расчёт, показали возможную выгоду. Решил идти дальше и не пожалел. В результате снизили стоимость и уменьшили ежегодный налог. Теперь рекомендую коллегам.',
      wide: true,
      image: reviewKongressImage
    },
    {
      name: 'Бывший руководитель ООО ЛОК «Горизонт» Гербяк А.А.',
      text:
        'Работали с 2013 по 2023 год по земельным участкам и объектам капитального строительства, где кадастровая стоимость была явно завышена. Специалисты грамотно обосновали снижение, подготовили отчёт и довели дело до результата. Налог уменьшился, окупаемость услуги быстрая. За многолетний опыт сотрудничества зарекомендовали себя как профессионалы. Рекомендую для сотрудничества.',
      wide: true,
      image: reviewGorizontLokImage
    },
    {
      name: 'Владелец гостевого дома, Республика Адыгея, Даховская, район «Лаго-Наки»',
      text:
        'Понравилось, что не обещают лишнего, а сразу считают реальные цифры. После анализа стало понятно, сколько можно сэкономить. Процесс прошёл без моего участия, итог положительный. Налог снизился, сотрудничеством доволен.',
      wide: false,
      image: reviewLagoNakiImage
    },
    {
      name: 'Владелец торгового центра, Липецкая область, г. Усмань',
      text:
        'Очень удобно, что компания берёт на себя весь процесс. Я только передал документы. В результате удалось снизить кадастровую стоимость и платить меньше налога. Экономия стабильная каждый год, это главное. Рекомендую!',
      wide: false,
      image: reviewUsmanImage
    }
  ],
  footerGroups: [
    {
      title: 'Навигация',
      links: [
        { id: 'hero', label: 'Главное' },
        { id: 'ideas', label: 'Три идеи' },
        { id: 'offer', label: 'Что мы предлагаем' }
      ]
    },
    {
      title: 'Сервисы',
      links: [
        { id: 'free-services', label: 'Бесплатные сервисы' },
        { id: 'checklist', label: 'Чек-лист' },
        { id: 'audit', label: 'Что можно проверить' }
      ]
    },
    {
      title: 'Контент',
      links: [
        { id: 'important', label: 'Важно знать' },
        { id: 'useful', label: 'Полезные сервисы' },
        { id: 'reviews', label: 'Отзывы' }
      ]
    }
  ],
  footerContent: {
    membershipLink: '/bilet.jpg',
    membershipImage: '/bilet.jpg',
    membershipTitle: 'Членский билет СРО',
    membershipText:
      'Мы в Союзе "Торгово-промышленной палаты Краснодарского края" и Торгово-промышленной палаты РФ с 3 июля 2025 года',
    phone: '+7 (960) 499-33-76',
    email: 'adm@fzkadastr.ru',
    socials: [
      {
        name: 'VK',
        url: 'https://vk.com/kadastr_nalog',
        icon: socialVkIcon,
        alt: 'Vk'
      },
      {
        name: 'TenChat',
        url: 'https://tenchat.ru/Fzkadastr?inviteId=51eb0f1e-166e-4c74-9baa-1cecece306f1',
        icon: socialTenchatIcon,
        alt: 'Tenchat'
      },
      {
        name: 'MAX',
        url: 'https://max.ru/u/f9LHodD0cOKHA3lF-4G0GWFCvreYccqqUG_CZiOJhTWOIEJBdYT1mHX81js',
        icon: socialMaxIcon,
        alt: 'Max'
      }
    ],
    documents: [
      {
        label: 'Политика конфиденциальности',
        url: '/Politika_Konfidentsialnosti.pdf',
        external: true
      }
    ]
  }
};

export function createDefaultLandingData() {
  return JSON.parse(JSON.stringify(defaultLandingPageData));
}
