// DRAFT: needs founder/legal review before store submission.
export type LegalDoc = {
  title: string;
  description: string; // one sentence, used for the page's meta description
  updated: string; // "2026-10-02" (same in both languages)
  intro: string;
  sections: { heading: string; body?: string[]; list?: string[] }[];
};

export const legalSlugs = ["privacy", "terms", "support", "delete-account"] as const;
export type LegalSlug = (typeof legalSlugs)[number];

const updated = "2026-10-02";

export const legal: Record<LegalSlug, Record<"ar" | "en", LegalDoc>> = {
  privacy: {
    ar: {
      title: "سياسة الخصوصية",
      description: "كيف يتعامل تطبيق بستيم مع بياناتك: ما نجمعه، ولماذا، وأين نحفظه، وكيف تحذفه.",
      updated,
      intro:
        "خصوصيتك تهمنا. هنا نشرح بكلمات بسيطة ما الذي يجمعه تطبيق بستيم، ولماذا نجمعه، وماذا يمكنك أن تفعل ببياناتك. بياناتك تخصك أنت، ونحن لا نبيعها.",
      sections: [
        {
          heading: "من نحن",
          body: [
            "بستيم تطبيق لأصحاب السيارات والمركبات والمعدات. يساعدك على تسجيل الصيانة، ومتابعة المواعيد والمصاريف، وحفظ تاريخ موثوق لمركبتك.",
            "الجهة الناشرة هي أحمد حمدي (فرد، مصر)، ويعمل باسم «بستيم». لا توجد شركة مسجّلة حتى الآن. الموقع: https://bestim-eg.com",
          ],
        },
        {
          heading: "ما البيانات التي نجمعها ولماذا",
          body: ["نجمع فقط ما يلزم لتعمل الميزات التي تستخدمها:"],
          list: [
            "الحساب: اسمك وبريدك الإلكتروني، لكي تسجّل دخولك وتجد بياناتك على أي هاتف.",
            "المركبات: النوع والطراز والسنة وقراءة العداد أو ساعات التشغيل. ويمكنك اختياريا إضافة رقم اللوحة ورقم الهيكل.",
            "سجلات الصيانة: نوع الخدمة والتاريخ وقراءة العداد والتكلفة واسم الورشة والملاحظات.",
            "التصحيحات: عندما تعدّل سجلا، نحتفظ بالأصل ونعرض التعديل بجانبه. هذا يجعل التاريخ أكثر ثقة عند البيع.",
            "المواعيد والمصاريف: المواعيد التي تضبطها والمبالغ التي تسجلها.",
            "صور الفواتير: الصور التي ترفقها بنفسك، وتُحفظ في مساحة خاصة بك.",
            "الإعدادات: تفضيلات التنبيهات واللغة والوضع الداكن.",
          ],
        },
        {
          heading: "الصوت والكاميرا والتنبيهات",
          body: [
            "نطلب أي إذن فقط عندما تستخدم الميزة التي تحتاجه، ويمكنك رفضه أو سحبه من إعدادات هاتفك في أي وقت.",
          ],
          list: [
            "الميكروفون: لتسجيل الصيانة بصوتك. يحوّل التعرّف على الكلام في هاتفك صوتك إلى نص، وقد تقدّم هذه الخدمة شركة Apple أو Google بحسب هاتفك. بعد ذلك تُعالَج النصوص لتعبئة حقول السجل، وتراجعها أنت قبل الحفظ. بستيم لا تحفظ تسجيلات صوتية.",
            "الكاميرا والصور: لإرفاق صورة فاتورة بسجل. لا نصل إلى صورك إلا التي تختارها بنفسك.",
            "التنبيهات: لتذكيرك بمواعيد الصيانة. تُجدول التذكيرات على هاتفك نفسه.",
          ],
        },
        {
          heading: "أين تُحفظ بياناتك ومن يعالجها",
          body: [
            "تُحفظ بياناتك لدى Supabase، وهي مزوّد استضافة وقواعد بيانات. تعمل بستيم على حماية كل صف من البيانات بحيث يرى كل مستخدم بياناته هو فقط.",
            "إذا سجّلت الدخول بحساب Google، تستخدم Google هذه الخدمة لتأكيد هويتك، ونستلم منها اسمك وبريدك الإلكتروني. وحيث يتوفر، قد يكون تسجيل الدخول عبر Apple متاحا بالطريقة نفسها.",
            "لا نستخدم أدوات إعلانات أو تتبّع لجهات أخرى داخل التطبيق.",
          ],
        },
        {
          heading: "المشاركة مع الآخرين",
          body: [
            "لا يرى أحد بياناتك إلا إذا شاركتها أنت. عندما تشارك تاريخ مركبة برمز QR أو برابط، يحصل المستلم على نسخة من السجل. الرابط صالح لمدة 7 أيام.",
            "عند التصدير بصيغة PDF أو CSV أو JSON، أنت تختار ما يُضمَّن في الملف. ما ترسله لغيرك يصبح في يده، ولا نستطيع سحبه منه.",
            "لا نبيع بياناتك ولا نؤجّرها، ولا يوجد في بستيم أي إعلانات.",
          ],
        },
        {
          heading: "مدة الاحتفاظ وحذف بياناتك",
          body: [
            "نحتفظ ببياناتك ما دام حسابك موجودا. عندما تحذف حسابك تُحذف بياناتك نهائيا، وتُمحى النسخ الاحتياطية خلال 30 يوما.",
            "للحذف من داخل التطبيق: تبويب «حسابي»، ثم «حذف حسابي». وإن لم تستطع فتح التطبيق، أرسل لنا من بريد الحساب إلى bestim.connect@gmail.com. التفاصيل الكاملة في صفحة حذف الحساب.",
            "يمكنك أيضا حذف بيانات مركبة واحدة فقط من داخل التطبيق.",
          ],
        },
        {
          heading: "الأطفال",
          body: [
            "بستيم غير موجّه للأطفال دون 13 سنة، ولا نجمع عمدا بيانات منهم. إذا علمت أن طفلا أنشأ حسابا، راسلنا وسنحذفه.",
          ],
        },
        {
          heading: "تغييرات على هذه السياسة",
          body: [
            "قد نعدّل هذه السياسة مع تطوّر التطبيق. سنضع التاريخ الجديد في أعلى الصفحة، وإذا كان التغيير مهما سنخبرك داخل التطبيق أو بالبريد.",
          ],
        },
        {
          heading: "تواصل معنا",
          body: ["لأي سؤال عن خصوصيتك أو بياناتك، راسلنا على bestim.connect@gmail.com."],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      description: "How the Bestim app handles your data: what we collect, why, where it is stored, and how to delete it.",
      updated,
      intro:
        "Your privacy matters to us. Here we explain in plain words what the Bestim app collects, why, and what you can do with your data. Your data is yours, and we do not sell it.",
      sections: [
        {
          heading: "Who we are",
          body: [
            "Bestim is an app for owners of cars, vehicles and machines. It helps you log maintenance, follow reminders and expenses, and keep a trustworthy history of your vehicle.",
            "The publisher is Ahmed Hamdy (an individual, Egypt), operating as Bestim. There is no registered company yet. Website: https://bestim-eg.com",
          ],
        },
        {
          heading: "What we collect and why",
          body: ["We collect only what is needed for the features you use:"],
          list: [
            "Account: your name and email, so you can sign in and find your data on any phone.",
            "Vehicles: make, model, year, and odometer or operating hours. You may also add a plate number and VIN if you want.",
            "Maintenance logs: service type, date, odometer, cost, workshop name and notes.",
            "Corrections: when you edit a log, we keep the original and show your edit next to it. This makes the history more trustworthy when you sell.",
            "Reminders and expenses: the reminders you set and the amounts you record.",
            "Receipt photos: the photos you attach yourself, kept in private storage.",
            "Settings: notification preferences, language and dark mode.",
          ],
        },
        {
          heading: "Voice, camera and notifications",
          body: [
            "We ask for a permission only when you use the feature that needs it. You can refuse it, or take it back in your phone settings at any time.",
          ],
          list: [
            "Microphone: to log maintenance by voice. Your phone's speech recognition turns your speech into text, and depending on your phone this service may be provided by Apple or Google. The text is then processed to fill in the log fields, and you review it before saving. Bestim does not store audio recordings.",
            "Camera and photos: to attach a receipt photo to a log. We only access the photos you choose.",
            "Notifications: to remind you of maintenance. Reminders are scheduled on your phone itself.",
          ],
        },
        {
          heading: "Where your data is stored and who processes it",
          body: [
            "Your data is stored with Supabase, a hosting and database provider. Bestim protects every row of data so that each user can see only their own.",
            "If you sign in with Google, Google is used to confirm who you are, and we receive your name and email from it. Where available, sign-in with Apple may work in the same way.",
            "We do not use third-party advertising or tracking tools inside the app.",
          ],
        },
        {
          heading: "Sharing with others",
          body: [
            "No one sees your data unless you share it. When you share a vehicle's history by QR code or link, the receiver gets a copy of the history. The link is valid for 7 days.",
            "When you export as PDF, CSV or JSON, you choose what goes into the file. What you send to someone else is in their hands, and we cannot take it back.",
            "We do not sell or rent your data, and Bestim has no ads.",
          ],
        },
        {
          heading: "How long we keep data and how to delete it",
          body: [
            "We keep your data as long as your account exists. When you delete your account, your data is deleted permanently, and backups are cleared within 30 days.",
            "To delete from inside the app: Account tab, then Delete my account. If you cannot open the app, email us from the account's email address at bestim.connect@gmail.com. The full details are on the Delete account page.",
            "You can also delete the data of a single vehicle from inside the app.",
          ],
        },
        {
          heading: "Children",
          body: [
            "Bestim is not directed at children under 13, and we do not knowingly collect data from them. If you learn that a child has created an account, write to us and we will delete it.",
          ],
        },
        {
          heading: "Changes to this policy",
          body: [
            "We may update this policy as the app grows. We will put the new date at the top of the page, and if a change is important we will tell you in the app or by email.",
          ],
        },
        {
          heading: "Contact us",
          body: ["For any question about your privacy or your data, write to us at bestim.connect@gmail.com."],
        },
      ],
    },
  },

  terms: {
    ar: {
      title: "شروط الاستخدام",
      description: "الشروط البسيطة لاستخدام تطبيق بستيم: حسابك، ومسؤولياتك، وحدود مسؤوليتنا.",
      updated,
      intro:
        "هذه هي القواعد البسيطة لاستخدام بستيم. اقرأها بهدوء، فهي تحميك وتحمينا.",
      sections: [
        {
          heading: "موافقتك على الشروط",
          body: [
            "باستخدامك تطبيق بستيم أو موقعه، أنت توافق على هذه الشروط وعلى سياسة الخصوصية. إذا لم توافق، من فضلك لا تستخدم التطبيق.",
          ],
        },
        {
          heading: "ما هو بستيم",
          body: [
            "بستيم تطبيق لتسجيل صيانة المركبات بالصوت أو باليد، ومتابعة المواعيد والمصاريف، وحفظ تاريخ الخدمة ومشاركته عند البيع. الناشر هو أحمد حمدي (فرد، مصر)، ويعمل باسم «بستيم».",
          ],
        },
        {
          heading: "حسابك",
          body: [
            "يمكنك الدخول بالبريد وكلمة المرور، أو بحساب Google، أو كزائر. وحيث يتوفر، قد يكون الدخول عبر Apple متاحا أيضا.",
            "أنت مسؤول عن حفظ كلمة مرورك، وعن كل ما يحدث في حسابك. إذا شككت أن أحدا دخل حسابك، راسلنا فورا.",
          ],
        },
        {
          heading: "بياناتك ومسؤوليتك عنها",
          body: [
            "ما تسجّله في بستيم يبقى ملكك. تمنحنا فقط الحق في حفظه وعرضه لك، وفي مشاركته مع من تختاره أنت.",
            "أنت مسؤول عن صحة ما تدخله: الأرقام والتواريخ والتكاليف. إذا أخطأت يمكنك تصحيح السجل، وسيبقى الأصل ظاهرا بجانب التصحيح. لا تدخل معلومات تعرف أنها غير صحيحة، خصوصا إذا كنت ستشاركها مع مشترٍ.",
          ],
        },
        {
          heading: "المواعيد ليست نصيحة ميكانيكية",
          body: [
            "تنبيهات الصيانة في بستيم مجرد دليل يساعدك على التذكّر. ليست نصيحة فنية ولا بديلا عن الفحص.",
            "اتبع دائما جدول الصيانة الذي تحدده الشركة المصنّعة، واستشر ميكانيكيا مؤهلا قبل أي قرار يخص سلامة مركبتك.",
          ],
        },
        {
          heading: "مشاركة التاريخ لا تنقل الملكية",
          body: [
            "عندما تشارك تاريخ مركبة، يحصل المستلم على نسخة من السجل فقط. هذا لا ينقل ملكية المركبة قانونيا. نقل الملكية له إجراءاته الرسمية خارج بستيم.",
            "نحن لا نضمن صحة السجلات التي يدخلها المستخدمون، ولا نتحقق من أي بيع.",
          ],
        },
        {
          heading: "الاستخدام المقبول",
          body: ["من فضلك لا تستخدم بستيم في أي من الآتي:"],
          list: [
            "إدخال بيانات كاذبة أو مضللة لخداع مشترٍ أو أي شخص آخر.",
            "محاولة الوصول إلى حساب أو بيانات غيرك.",
            "تعطيل التطبيق أو خوادمه، أو محاولة اختراقهما.",
            "استخدام التطبيق لأي غرض مخالف للقانون.",
          ],
        },
        {
          heading: "توفر الخدمة والتغييرات",
          body: [
            "نبذل جهدنا ليعمل بستيم دائما، لكن قد تتوقف الخدمة أحيانا للصيانة أو لأسباب خارجة عن إرادتنا. قد نغيّر ميزات التطبيق أو نضيف إليها أو نوقف بعضها.",
            "قد نعدّل هذه الشروط أيضا. سنضع التاريخ الجديد في أعلى الصفحة، واستمرارك في الاستخدام بعد التعديل يعني موافقتك عليه.",
          ],
        },
        {
          heading: "حدود المسؤولية",
          body: [
            "بستيم يُقدَّم كما هو، دون ضمانات بأنه سيعمل دائما بلا أخطاء أو انقطاع.",
            "في أقصى حد يسمح به القانون، لا نتحمل مسؤولية أي ضرر ينتج عن الاعتماد على المواعيد أو السجلات، أو عن فقدان بيانات، أو عن قرار شراء أو بيع، أو عن عطل أو حادث في مركبتك. وهذا لا يلغي أي حق لك لا يجوز قانونا التنازل عنه.",
          ],
        },
        {
          heading: "القانون الواجب التطبيق",
          body: ["تخضع هذه الشروط للقانون المصري."],
        },
        {
          heading: "تواصل معنا",
          body: ["لأي سؤال عن هذه الشروط، راسلنا على bestim.connect@gmail.com."],
        },
      ],
    },
    en: {
      title: "Terms of Use",
      description: "The simple terms for using the Bestim app: your account, your responsibilities, and the limits of our liability.",
      updated,
      intro:
        "These are the simple rules for using Bestim. Please read them calmly. They protect you and they protect us.",
      sections: [
        {
          heading: "Accepting these terms",
          body: [
            "By using the Bestim app or website, you agree to these terms and to the Privacy Policy. If you do not agree, please do not use the app.",
          ],
        },
        {
          heading: "What Bestim is",
          body: [
            "Bestim is an app for logging vehicle maintenance by voice or by hand, following reminders and expenses, and keeping a service history you can share when you sell. The publisher is Ahmed Hamdy (an individual, Egypt), operating as Bestim.",
          ],
        },
        {
          heading: "Your account",
          body: [
            "You can sign in with email and password, with a Google account, or as a guest. Where available, sign-in with Apple may also be offered.",
            "You are responsible for keeping your password safe and for everything that happens in your account. If you think someone got into your account, write to us right away.",
          ],
        },
        {
          heading: "Your content and your responsibility",
          body: [
            "What you record in Bestim stays yours. You only give us the right to store it, show it to you, and share it with the people you choose.",
            "You are responsible for the accuracy of what you enter: numbers, dates and costs. If you make a mistake, you can correct the log, and the original stays visible next to the correction. Do not enter information you know is untrue, especially if you will share it with a buyer.",
          ],
        },
        {
          heading: "Reminders are not mechanical advice",
          body: [
            "Maintenance reminders in Bestim are only a helpful guide to help you remember. They are not technical advice and they do not replace an inspection.",
            "Always follow the maintenance schedule set by the manufacturer, and ask a qualified mechanic before any decision about your vehicle's safety.",
          ],
        },
        {
          heading: "Sharing a history does not transfer ownership",
          body: [
            "When you share a vehicle's history, the receiver gets a copy of the records only. This does not transfer legal ownership of the vehicle. Transferring ownership follows official procedures outside Bestim.",
            "We do not guarantee that records entered by users are correct, and we do not check any sale.",
          ],
        },
        {
          heading: "Acceptable use",
          body: ["Please do not use Bestim for any of the following:"],
          list: [
            "Entering false or misleading data to deceive a buyer or anyone else.",
            "Trying to reach another person's account or data.",
            "Disrupting the app or its servers, or trying to break into them.",
            "Using the app for anything against the law.",
          ],
        },
        {
          heading: "Availability and changes",
          body: [
            "We try to keep Bestim working all the time, but the service may sometimes stop for maintenance or for reasons outside our control. We may change, add or remove features.",
            "We may also update these terms. We will put the new date at the top of the page, and if you keep using the app after an update, it means you accept it.",
          ],
        },
        {
          heading: "Limits of our liability",
          body: [
            "Bestim is provided as it is, with no promise that it will always work without errors or interruptions.",
            "To the fullest extent the law allows, we are not responsible for any harm that comes from relying on reminders or records, from lost data, from a decision to buy or sell, or from a breakdown or accident of your vehicle. This does not take away any right you have that the law does not allow you to give up.",
          ],
        },
        {
          heading: "Governing law",
          body: ["These terms are governed by the laws of Egypt."],
        },
        {
          heading: "Contact us",
          body: ["For any question about these terms, write to us at bestim.connect@gmail.com."],
        },
      ],
    },
  },

  support: {
    ar: {
      title: "الدعم",
      description: "كيف تتواصل مع فريق بستيم، وإجابات سريعة عن أسئلة شائعة.",
      updated,
      intro: "نحن هنا لمساعدتك. اكتب لنا وسنرد عليك بأسرع ما نستطيع.",
      sections: [
        {
          heading: "راسلنا",
          body: ["أرسل رسالتك إلى bestim.connect@gmail.com. يمكنك الكتابة بالعربية أو بالإنجليزية."],
        },
        {
          heading: "ماذا تكتب في الرسالة",
          body: ["كلما كانت الرسالة أوضح، كان حل المشكلة أسرع. من فضلك اذكر:"],
          list: [
            "طراز هاتفك (مثلا iPhone 15 أو Samsung A54).",
            "لغة التطبيق عندك: العربية أو الإنجليزية.",
            "ماذا حدث بالضبط، وماذا كنت تتوقع أن يحدث. ولقطة شاشة تفيدنا كثيرا.",
          ],
        },
        {
          heading: "متى سنرد عليك",
          body: ["نرد عادة خلال 3 أيام عمل."],
        },
        {
          heading: "نسيت كلمة المرور",
          body: [
            "في شاشة تسجيل الدخول اضغط «نسيت كلمة المرور؟» وأدخل بريدك. سيصلك رابط لاختيار كلمة مرور جديدة. إذا لم يصل، تفقّد مجلد الرسائل غير المرغوبة.",
          ],
        },
        {
          heading: "تغيير اللغة",
          body: ["من تبويب «حسابي» اختر «اللغة» ثم اللغة التي تريدها. سيُعاد تشغيل التطبيق لتطبيقها."],
        },
        {
          heading: "إضافة مركبة أخرى",
          body: ["من تبويب «سياراتي» اضغط «أضف مركبة»، ثم أدخل بياناتها. يمكنك إضافة أكثر من مركبة والتنقل بينها."],
        },
        {
          heading: "مشاركة تاريخ مركبة",
          body: [
            "من تبويب «حسابي» اضغط «شارك تاريخ السيارة»، ثم جهّز المشاركة واختر رمز QR أو الرابط. الرابط صالح لمدة 7 أيام، ويحصل المستلم على نسخة من السجل.",
          ],
        },
      ],
    },
    en: {
      title: "Support",
      description: "How to reach the Bestim team, plus quick answers to common questions.",
      updated,
      intro: "We are here to help. Write to us and we will reply as soon as we can.",
      sections: [
        {
          heading: "Write to us",
          body: ["Send your message to bestim.connect@gmail.com. You can write in Arabic or in English."],
        },
        {
          heading: "What to put in your message",
          body: ["The clearer the message, the faster we can fix the problem. Please tell us:"],
          list: [
            "Your phone model (for example iPhone 15 or Samsung A54).",
            "The app language you use: Arabic or English.",
            "What exactly happened, and what you expected to happen. A screenshot helps a lot.",
          ],
        },
        {
          heading: "When we will reply",
          body: ["We usually reply within 3 working days."],
        },
        {
          heading: "I forgot my password",
          body: [
            "On the sign-in screen, tap Forgot password? and enter your email. You will get a link to choose a new password. If it does not arrive, check your spam folder.",
          ],
        },
        {
          heading: "Change the language",
          body: ["In the Account tab, choose Language and then the language you want. The app will restart to apply it."],
        },
        {
          heading: "Add another vehicle",
          body: ["In the Vehicles tab, tap Add vehicle and enter its details. You can add more than one vehicle and switch between them."],
        },
        {
          heading: "Share a vehicle's history",
          body: [
            "In the Account tab, tap Share vehicle history, then prepare the share and choose the QR code or the link. The link is valid for 7 days, and the receiver gets a copy of the history.",
          ],
        },
      ],
    },
  },

  "delete-account": {
    ar: {
      title: "حذف الحساب",
      description: "كيف تحذف حسابك وبياناتك في تطبيق بستيم نهائيا، من داخل التطبيق أو بالبريد.",
      updated,
      intro:
        "هذه الصفحة تخص تطبيق «بستيم» (Bestim) الذي ينشره أحمد حمدي (فرد، مصر) باسم «بستيم». يمكنك حذف حسابك وبياناتك في أي وقت، وبطريقتين.",
      sections: [
        {
          heading: "الطريقة الأولى: من داخل التطبيق",
          body: ["اتبع هذه الخطوات:"],
          list: [
            "1. افتح تطبيق بستيم وسجّل الدخول إلى حسابك.",
            "2. اضغط تبويب «حسابي» في الشريط السفلي.",
            "3. انزل إلى أسفل الشاشة واضغط «حذف حسابي».",
            "4. ستظهر رسالة «حذف حسابك نهائيا؟». أكّد الحذف.",
          ],
        },
        {
          heading: "الطريقة الثانية: بالبريد",
          body: [
            "إذا لم تستطع فتح التطبيق، أرسل لنا طلب حذف من البريد الإلكتروني المسجّل في حسابك إلى bestim.connect@gmail.com. اكتب في العنوان «حذف الحساب».",
            "نتحقق أن الطلب من صاحب الحساب، ثم ننفّذه خلال 30 يوما.",
          ],
        },
        {
          heading: "ما الذي يُحذف",
          body: ["يُحذف نهائيا، ولا يمكن استرجاعه بعد ذلك:"],
          list: [
            "حسابك وبياناتك الشخصية (الاسم والبريد).",
            "كل مركباتك.",
            "كل سجلات الصيانة.",
            "كل التصحيحات التي أضفتها على السجلات.",
            "كل المواعيد والتذكيرات.",
            "كل المصاريف.",
            "كل صور الفواتير.",
          ],
        },
        {
          heading: "ما الذي قد يبقى",
          list: [
            "النسخ التي شاركتها مع شخص آخر قبل الحذف (عبر QR أو رابط). هذه النسخة أصبحت في يد المستلم ولا نستطيع حذفها من عنده.",
            "النسخ الاحتياطية. تُمحى بالكامل خلال 30 يوما من الحذف.",
          ],
        },
      ],
    },
    en: {
      title: "Delete Account",
      description: "How to permanently delete your account and data in the Bestim app, from inside the app or by email.",
      updated,
      intro:
        "This page is about the Bestim app (بستيم), published by Ahmed Hamdy (an individual, Egypt) under the name Bestim. You can delete your account and data at any time, in two ways.",
      sections: [
        {
          heading: "Option 1: inside the app",
          body: ["Follow these steps:"],
          list: [
            "1. Open the Bestim app and sign in to your account.",
            "2. Tap the Account tab in the bottom bar.",
            "3. Scroll to the bottom of the screen and tap Delete my account.",
            "4. A message will ask Delete your account permanently? Confirm the deletion.",
          ],
        },
        {
          heading: "Option 2: by email",
          body: [
            "If you cannot open the app, send us a deletion request from the email address registered to your account, to bestim.connect@gmail.com. Use Delete account as the subject.",
            "We check that the request comes from the account owner, then carry it out within 30 days.",
          ],
        },
        {
          heading: "What is deleted",
          body: ["The following is deleted permanently and cannot be recovered afterwards:"],
          list: [
            "Your account and personal details (name and email).",
            "All your vehicles.",
            "All maintenance logs.",
            "All corrections you added to logs.",
            "All reminders.",
            "All expenses.",
            "All receipt photos.",
          ],
        },
        {
          heading: "What may remain",
          list: [
            "Copies you already shared with someone else before deleting (by QR or link). That copy is now with the receiver, and we cannot delete it from them.",
            "Backups. They are cleared completely within 30 days of the deletion.",
          ],
        },
      ],
    },
  },
};
