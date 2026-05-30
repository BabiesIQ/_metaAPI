import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBackendUrl } from "@/lib/config";
import {
  Check,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Tag,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.subject.trim()) errors.subject = "Subject is required.";
  if (!form.message.trim()) {
    errors.message = "Message is required.";
  } else if (form.message.trim().length < 20) {
    errors.message = "Message must be at least 20 characters.";
  }
  return errors;
}

// ─── Why contact us cards ─────────────────────────────────────────────────────
const WHY_CARDS = [
  {
    icon: Clock,
    title: "Quick Response",
    desc: "We reply within 24 hours on business days — usually much faster.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: Wrench,
    title: "Technical Support",
    desc: "Our team knows the API inside-out. Bugs, integration help, or edge cases — we've got it.",
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
  {
    icon: MessageSquare,
    title: "Business Inquiries",
    desc: "Custom plans, white-label options, and volume pricing — let's build something together.",
    color: "text-foreground",
    bg: "bg-muted/60 border-border",
  },
];

// ─── Animated success checkmark ───────────────────────────────────────────────
function AnimatedCheckmark() {
  return (
    <motion.div
      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      style={{
        background: "oklch(var(--primary) / 0.12)",
        border: "1px solid oklch(var(--primary) / 0.3)",
      }}
    >
      <motion.svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.circle
          cx="18"
          cy="18"
          r="16"
          stroke="oklch(0.72 0.24 254)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        />
        <motion.path
          d="M11 18.5L15.5 23L25 13"
          stroke="oklch(0.72 0.24 254)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.5, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleBlur(field: keyof FormState) {
    const fieldErrors = validate(form);
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("subject", form.subject.trim());
      formData.append("message", form.message.trim());

      const res = await fetch(`${getBackendUrl()}/contact.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }

      setSubmitted(true);
      toast.success("Message sent!", {
        description: "We'll get back to you as soon as possible.",
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Please try again or email us directly.";
      toast.error("Failed to send message", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <section
        className="min-h-[calc(100vh-4rem)] bg-background py-16 px-4"
        data-ocid="contact.page"
      >
        <div className="container mx-auto max-w-5xl">
          {/* Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-mono px-3 py-1 rounded-full mb-4">
              <Mail className="w-3 h-3" />
              Get in Touch
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3 tracking-tight">
              Contact Us
            </h1>
            <p className="text-muted-foreground font-body text-sm max-w-md mx-auto">
              Have a question, bug report, or want to explore the Business plan?
              We respond within one business day.
            </p>
          </motion.div>

          {/* Why contact us */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {WHY_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`rounded-xl border p-5 ${card.bg} transition-all duration-300`}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-card">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Form + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <motion.div
              className="space-y-4 lg:pt-2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {[
                {
                  icon: Mail,
                  title: "Email",
                  value: "support@babiesiq.com",
                  href: "mailto:support@babiesiq.com",
                },
                {
                  icon: MessageSquare,
                  title: "Response Time",
                  value: "Within 1 business day",
                  href: null,
                },
                {
                  icon: MapPin,
                  title: "Service",
                  value: "Available worldwide",
                  href: null,
                },
              ].map(({ icon: Icon, title, value, href }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-body">
                      {title}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-display font-semibold text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-display font-semibold text-foreground truncate">
                        {value}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="font-display font-bold text-2xl mb-1">
                  <span className="text-primary">Babies</span>
                  <span className="text-foreground">IQ</span>
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  YouTube Audio and Video Streaming API
                </p>
              </div>
            </motion.div>

            {/* Form card */}
            <motion.div
              className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden shadow-elevated"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-0.5 w-full gradient-primary" />
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      className="text-center py-12 flex flex-col items-center gap-4"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35 }}
                      data-ocid="contact.success_state"
                    >
                      <AnimatedCheckmark />
                      <div>
                        <h2 className="font-display font-semibold text-xl text-foreground mb-1">
                          Message Sent!
                        </h2>
                        <p className="text-sm text-muted-foreground font-body">
                          Thanks for reaching out. We will be in touch shortly.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 font-body text-sm hover:scale-[1.03] transition-smooth"
                        onClick={() => {
                          setSubmitted(false);
                          setForm({
                            name: "",
                            email: "",
                            subject: "",
                            message: "",
                          });
                        }}
                        data-ocid="contact.send_another.button"
                      >
                        Send another message
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Name + Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <motion.div
                          className="space-y-1.5"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                        >
                          <Label
                            htmlFor="contact-name"
                            className="text-sm font-body flex items-center gap-1.5 text-foreground"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                            Name{" "}
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            id="contact-name"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={(e) =>
                              handleChange("name", e.target.value)
                            }
                            onBlur={() => handleBlur("name")}
                            aria-invalid={!!errors.name}
                            aria-describedby={
                              errors.name ? "contact-name-error" : undefined
                            }
                            className={
                              errors.name
                                ? "border-destructive focus-visible:ring-destructive/40"
                                : ""
                            }
                            data-ocid="contact.name.input"
                          />
                          {errors.name && (
                            <p
                              id="contact-name-error"
                              className="text-xs text-destructive font-body mt-1"
                              data-ocid="contact.name.field_error"
                            >
                              {errors.name}
                            </p>
                          )}
                        </motion.div>

                        {/* Email */}
                        <motion.div
                          className="space-y-1.5"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <Label
                            htmlFor="contact-email"
                            className="text-sm font-body flex items-center gap-1.5 text-foreground"
                          >
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            Email{" "}
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) =>
                              handleChange("email", e.target.value)
                            }
                            onBlur={() => handleBlur("email")}
                            aria-invalid={!!errors.email}
                            aria-describedby={
                              errors.email ? "contact-email-error" : undefined
                            }
                            className={
                              errors.email
                                ? "border-destructive focus-visible:ring-destructive/40"
                                : ""
                            }
                            data-ocid="contact.email.input"
                          />
                          {errors.email && (
                            <p
                              id="contact-email-error"
                              className="text-xs text-destructive font-body mt-1"
                              data-ocid="contact.email.field_error"
                            >
                              {errors.email}
                            </p>
                          )}
                        </motion.div>
                      </div>

                      {/* Subject */}
                      <motion.div
                        className="space-y-1.5"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                      >
                        <Label
                          htmlFor="contact-subject"
                          className="text-sm font-body flex items-center gap-1.5 text-foreground"
                        >
                          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                          Subject{" "}
                          <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Input
                          id="contact-subject"
                          placeholder="What is this about?"
                          value={form.subject}
                          onChange={(e) =>
                            handleChange("subject", e.target.value)
                          }
                          onBlur={() => handleBlur("subject")}
                          aria-invalid={!!errors.subject}
                          aria-describedby={
                            errors.subject ? "contact-subject-error" : undefined
                          }
                          className={
                            errors.subject
                              ? "border-destructive focus-visible:ring-destructive/40"
                              : ""
                          }
                          data-ocid="contact.subject.input"
                        />
                        {errors.subject && (
                          <p
                            id="contact-subject-error"
                            className="text-xs text-destructive font-body mt-1"
                            data-ocid="contact.subject.field_error"
                          >
                            {errors.subject}
                          </p>
                        )}
                      </motion.div>

                      {/* Message */}
                      <motion.div
                        className="space-y-1.5"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <Label
                          htmlFor="contact-message"
                          className="text-sm font-body flex items-center gap-1.5 text-foreground"
                        >
                          Message{" "}
                          <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Describe your question or issue in detail (min 20 characters)"
                          value={form.message}
                          onChange={(e) =>
                            handleChange("message", e.target.value)
                          }
                          onBlur={() => handleBlur("message")}
                          rows={6}
                          aria-invalid={!!errors.message}
                          aria-describedby={
                            errors.message ? "contact-message-error" : undefined
                          }
                          className={
                            errors.message
                              ? "border-destructive focus-visible:ring-destructive/40 resize-none"
                              : "resize-none"
                          }
                          data-ocid="contact.message.textarea"
                        />
                        {errors.message && (
                          <p
                            id="contact-message-error"
                            className="text-xs text-destructive font-body mt-1"
                            data-ocid="contact.message.field_error"
                          >
                            {errors.message}
                          </p>
                        )}
                      </motion.div>

                      {/* Submit */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 }}
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full font-display font-semibold gap-2 h-11 gradient-primary text-white hover:opacity-90 hover:scale-[1.02] transition-smooth"
                          data-ocid="contact.submit.button"
                        >
                          {loading ? (
                            <>
                              <span
                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                                aria-hidden="true"
                              />
                              Sending
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </motion.div>
                      <p className="text-center text-xs text-muted-foreground font-body">
                        We typically respond within one business day.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
