import * as Dialog from "@radix-ui/react-dialog";
import {
  type AnimationEvent,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { usePopupContainer } from "../app/context";
import { Button } from "../button/Button";
import { cn } from "../lib/cn";
import { glassSurfaceClass } from "../lib/surface";

/** Matches `--nonla-dur-fast` exit animation; fallback if animationend is skipped. */
const EXIT_MS = 200;

const modalOverlayClass =
  "nonla-modal-overlay fixed inset-0 z-(--nonla-z-modal) bg-(--mask) data-[state=open]:animate-[nonla-overlay-in_var(--nonla-dur)_var(--nonla-ease-out)] data-[state=closed]:pointer-events-none data-[state=closed]:animate-[nonla-overlay-out_var(--nonla-dur-fast)_var(--nonla-ease-in)_forwards]";

const modalContentClass =
  "nonla-modal-content fixed top-[60px] left-1/2 z-[calc(var(--nonla-z-modal)+1)] flex w-[min(480px,calc(100vw-32px))] max-h-[calc(100vh-88px)] flex-col overflow-hidden rounded-[calc(var(--radius)+4px)] p-0 outline-none will-change-[transform,opacity] [transform:translate(-50%,0)] data-[state=open]:animate-[nonla-modal-in_var(--nonla-dur)_var(--nonla-ease-out)] data-[state=closed]:pointer-events-none data-[state=closed]:animate-[nonla-modal-out_var(--nonla-dur-fast)_var(--nonla-ease-in)_forwards] data-[centered=true]:top-1/2 data-[centered=true]:max-h-[calc(100vh-64px)] data-[centered=true]:[transform:translate(-50%,-50%)] data-[centered=true]:data-[state=open]:animate-[nonla-modal-in-centered_var(--nonla-dur)_var(--nonla-ease-out)] data-[centered=true]:data-[state=closed]:animate-[nonla-modal-out-centered_var(--nonla-dur-fast)_var(--nonla-ease-in)_forwards]";

export type ModalProps = {
  open?: boolean;
  visible?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode | null;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  afterClose?: () => void;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okButtonProps?: Record<string, unknown>;
  cancelButtonProps?: Record<string, unknown>;
  confirmLoading?: boolean;
  width?: number | string;
  centered?: boolean;
  destroyOnClose?: boolean;
  destroyOnHidden?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  className?: string;
  /** Root positioning (`style={{ top }}`). */
  style?: CSSProperties;
  styles?: { body?: CSSProperties; content?: CSSProperties; header?: CSSProperties; footer?: CSSProperties; container?: CSSProperties };
  onOpenChange?: (open: boolean) => void;
};

export type ModalConfirmProps = {
  title?: ReactNode;
  content?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okType?: "primary" | "danger" | "default";
  okButtonProps?: { danger?: boolean; color?: string; type?: string };
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  centered?: boolean;
  width?: number | string;
};

type ConfirmHandle = { destroy: () => void; update: (p: Partial<ModalConfirmProps>) => void };

function ModalView({
  open,
  visible,
  title,
  children,
  footer,
  onOk,
  onCancel,
  onClose,
  afterClose,
  okText = "OK",
  cancelText = "Cancel",
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  width = 480,
  centered = false,
  destroyOnClose,
  destroyOnHidden,
  closable = true,
  maskClosable = true,
  className,
  style,
  styles,
  onOpenChange,
}: ModalProps) {
  const isOpen = open ?? visible ?? false;
  const [loading, setLoading] = useState(false);
  const shouldDestroy = Boolean(destroyOnHidden ?? destroyOnClose);
  // Keep body mounted through the exit animation; clear only after it finishes.
  const [present, setPresent] = useState(isOpen);
  const closedRef = useRef(true);
  const wasOpenRef = useRef(isOpen);
  const afterCloseRef = useRef(afterClose);
  afterCloseRef.current = afterClose;

  const finishExit = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (shouldDestroy) setPresent(false);
    afterCloseRef.current?.();
  };

  useEffect(() => {
    if (isOpen) {
      closedRef.current = false;
      wasOpenRef.current = true;
      setPresent(true);
      return;
    }
    // Only schedule exit cleanup after an open→close transition (not initial mount).
    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;
    const t = window.setTimeout(finishExit, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [isOpen, shouldDestroy]);

  const body = !shouldDestroy || present ? children : null;

  const close = () => {
    onOpenChange?.(false);
    onCancel?.();
    onClose?.();
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      await onOk?.();
      onOpenChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  const busy = confirmLoading ?? loading;

  const defaultFooter =
    footer === null ? null : footer !== undefined ? (
      footer
    ) : (
      <>
        <Button type="default" onClick={close} {...(cancelButtonProps as object)}>
          {cancelText}
        </Button>
        <Button type="primary" loading={busy} onClick={handleOk} {...(okButtonProps as object)}>
          {okText}
        </Button>
      </>
    );

  const onContentAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (!isOpen) finishExit();
  };

  const portal = usePopupContainer()?.();

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(next) => {
        onOpenChange?.(next);
        if (!next) {
          onCancel?.();
          onClose?.();
        }
      }}
    >
      {isOpen || present ? (
        <Dialog.Portal container={portal}>
          <Dialog.Overlay className={modalOverlayClass} />
          <Dialog.Content
            className={cn(modalContentClass, glassSurfaceClass, className)}
            data-centered={centered ? "true" : undefined}
            style={{ width, ...style, ...styles?.container, ...styles?.content }}
            onAnimationEnd={onContentAnimationEnd}
            onEscapeKeyDown={(e) => {
              e.stopPropagation();
            }}
            onPointerDownOutside={(e) => {
              if (!maskClosable) e.preventDefault();
            }}
            onInteractOutside={(e) => {
              if (!maskClosable) e.preventDefault();
            }}
          >
            {(title || closable) && (
              <div className="nonla-modal-header flex shrink-0 items-center justify-between gap-3 bg-transparent px-4 py-3" style={styles?.header}>
                <Dialog.Title className="nonla-modal-title m-0 text-[15px] leading-[1.4] font-semibold text-foreground">{title}</Dialog.Title>
                {closable ? (
                  <Dialog.Close className="nonla-modal-close -mt-1 -mr-1.5 -mb-1 ml-0 inline-flex size-7 cursor-pointer items-center justify-center rounded-(--radius) border-0 bg-transparent text-[18px] leading-none text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close">
                    ×
                  </Dialog.Close>
                ) : null}
              </div>
            )}
            <div className="nonla-modal-body flex-1 overflow-auto bg-transparent px-4 pt-4 pb-6 text-sm leading-normal text-foreground" style={styles?.body}>
              {body}
            </div>
            {defaultFooter != null ? (
              <div className="nonla-modal-footer flex shrink-0 items-center justify-end gap-2 bg-transparent px-4 py-2.5" style={styles?.footer}>
                {typeof defaultFooter === "function" ? null : defaultFooter}
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

function ConfirmHost({ initial, onDone }: { initial: ModalConfirmProps; onDone: () => void }) {
  const [open, setOpen] = useState(true);
  const [props, setProps] = useState(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProps(initial);
  }, [initial]);

  useEffect(() => {
    (ConfirmHost as unknown as { _update?: (p: Partial<ModalConfirmProps>) => void })._update = (p) => setProps((prev) => ({ ...prev, ...p }));
  }, []);

  const close = () => {
    setOpen(false);
    props.onCancel?.();
  };

  const ok = async () => {
    try {
      setLoading(true);
      await props.onOk?.();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const danger = props.okType === "danger" || props.okButtonProps?.danger;

  return (
    <ModalView
      open={open}
      title={props.title}
      width={props.width}
      centered={props.centered}
      confirmLoading={loading}
      okText={props.okText ?? "OK"}
      cancelText={props.cancelText ?? "Cancel"}
      okButtonProps={{ danger }}
      onOk={ok}
      onCancel={close}
      afterClose={onDone}
      onOpenChange={(v) => {
        if (!v) close();
      }}
    >
      {props.content}
    </ModalView>
  );
}

type ConfirmJob = { id: number; props: ModalConfirmProps };
type ConfirmOpener = (props: ModalConfirmProps) => ConfirmHandle;

let openConfirm: ConfirmOpener | null = null;

function mountFallback(props: ModalConfirmProps): ConfirmHandle {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root: Root = createRoot(el);
  const destroy = () => {
    root.unmount();
    el.remove();
  };
  root.render(<ConfirmHost initial={props} onDone={destroy} />);
  return {
    destroy,
    update: (p) => (ConfirmHost as unknown as { _update?: (x: Partial<ModalConfirmProps>) => void })._update?.(p),
  };
}

function mountConfirm(props: ModalConfirmProps): ConfirmHandle {
  return openConfirm ? openConfirm(props) : mountFallback(props);
}

/** Mounted by `App` so `Modal.confirm` shares theme / context. */
export function ConfirmHolder() {
  const [jobs, setJobs] = useState<ConfirmJob[]>([]);
  const seq = useRef(0);

  useLayoutEffect(() => {
    openConfirm = (props) => {
      const id = ++seq.current;
      setJobs((list) => [...list, { id, props }]);
      return {
        destroy: () => setJobs((list) => list.filter((job) => job.id !== id)),
        update: (p) =>
          setJobs((list) => list.map((job) => (job.id === id ? { ...job, props: { ...job.props, ...p } } : job))),
      };
    };
    return () => {
      openConfirm = null;
    };
  }, []);

  return (
    <>
      {jobs.map((job) => (
        <ConfirmHost key={job.id} initial={job.props} onDone={() => setJobs((list) => list.filter((j) => j.id !== job.id))} />
      ))}
    </>
  );
}

export const Modal = Object.assign(ModalView, {
  confirm: (props: ModalConfirmProps) => mountConfirm(props),
  info: (props: ModalConfirmProps) => mountConfirm(props),
  warning: (props: ModalConfirmProps) => mountConfirm(props),
  error: (props: ModalConfirmProps) => mountConfirm({ ...props, okType: "danger" }),
  success: (props: ModalConfirmProps) => mountConfirm(props),
});
