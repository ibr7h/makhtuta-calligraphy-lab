# Brush / Qalam Engine

## الهدف

محاكاة قصبة عربية يمكن التحكم بها تعليميًا دون ربط الرسم بمقاس Canvas أو صورة نقطية ثابتة.

## الإعدادات الحالية

### Brush Tip Shape
- `size`: العرض الأساسي للقصبة.
- `angle`: زاوية قطّة القصبة.
- `roundness`: مزج حواف أكثر استدارة مع القطّة المسطحة.
- `spacing`: الحد الأدنى لأخذ نقاط جديدة نسبةً إلى حجم الفرشاة.

### Stroke Dynamics
- `smoothing`: تنعيم تكيفي مع سرعة الحركة.
- `opacity`: شفافية الحبر لكل ضربة.
- `rotationSource`: زاوية ثابتة أو Twist عند توفره.
- `twistInfluence`: مقدار تأثير دوران القلم على الزاوية الأساسية.

### Pressure
- `pressureEnabled`.
- `pressureSensitivity`.
- `pressureMinWidth`.
- `pressureCurve`: soft / linear / firm.
- نطاق ضغط قابل للمعايرة لكل جهاز.

## ثبات إعادة الرسم

كل Stroke يخزن نسخة من إعداداته لحظة بدء الضربة. تعديل Brush Settings بعد ذلك لا يغيّر الضربات السابقة، ولذلك تبقى Undo وReplay وResize حتمية.

## المرحلة التالية

- فصل بيانات الفرشاة عن واجهة المستخدم.
- إنشاء BrushPreset schema بإصدار versioned.
- دعم Presets متعددة بأسماء يحددها المستخدم.
- تصدير واستيراد Preset JSON.
