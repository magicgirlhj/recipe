import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Cloud,
  CloudDownload,
  CloudOff,
  CloudUpload,
  LoaderCircle,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
  UserPlus,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageHeader } from "../components/PageHeader";
import { useKitchen, type CloudSyncTone } from "../context/KitchenContext";

type ConfirmAction = "upload" | "download";

const statusStyles: Record<CloudSyncTone, string> = {
  local: "bg-stone-100 text-stone-700",
  pending: "bg-orange-100 text-orange-700",
  synced: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
};

function StatusIcon({ tone }: { tone: CloudSyncTone }) {
  if (tone === "pending") return <LoaderCircle className="animate-spin" size={18} />;
  if (tone === "synced") return <CheckCircle2 size={18} />;
  if (tone === "error") return <AlertCircle size={18} />;
  return <CloudOff size={18} />;
}

export function Settings() {
  const {
    cloudConfig,
    cloudConfigSource,
    cloudConfigured,
    cloudUser,
    cloudReady,
    cloudStatus,
    configureCloud,
    clearCloudConfiguration,
    signUpCloud,
    signInCloud,
    signOutCloud,
    uploadLocalData,
    downloadCloudData,
  } = useKitchen();
  const [configDraft, setConfigDraft] = useState(cloudConfig);
  const [showConnection, setShowConnection] = useState(!cloudConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const isAutoConfigured = cloudConfigSource === "embedded";

  useEffect(() => setConfigDraft(cloudConfig), [cloudConfig]);
  useEffect(() => {
    if (cloudConfigured) setShowConnection(false);
  }, [cloudConfigured]);

  function saveConnection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (configureCloud(configDraft)) {
      setShowConnection(false);
    }
  }

  async function submitAuth(mode: "signin" | "signup") {
    if (!email.trim()) return;
    if (password.length < 6) return;

    if (mode === "signin") {
      await signInCloud(email, password);
    } else {
      await signUpCloud(email, password);
    }
  }

  async function runConfirmedAction() {
    const action = confirmAction;
    setConfirmAction(null);

    if (action === "upload") await uploadLocalData();
    if (action === "download") await downloadCloudData();
  }

  const confirmCopy = {
    upload: {
      title: "上传本机数据",
      description: "这会使用当前设备里的菜谱、Wishlist 和冰箱数据覆盖云端版本。",
      label: "确认上传",
    },
    download: {
      title: "下载云端数据",
      description: "这会使用云端版本覆盖当前设备里的菜谱、Wishlist 和冰箱数据。",
      label: "确认下载",
    },
  } satisfies Record<ConfirmAction, { title: string; description: string; label: string }>;

  return (
    <div>
      <PageHeader eyebrow="Account & Sync" title="设置" />

      <div className="grid gap-5">
        <section className="k-card overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-stone-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-kitchen-mint text-green-700">
                <Cloud size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black">云端同步</h2>
                <p className="mt-1 text-sm text-kitchen-muted">
                  {cloudUser
                    ? cloudUser.email
                    : isAutoConfigured
                      ? "连接已由网站自动配置，登录后开始同步。"
                      : cloudConfigured
                        ? "连接已配置，登录后开始同步。"
                        : "当前仅保存在这台设备。"}
                </p>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-bold ${statusStyles[cloudStatus.tone]}`}>
              <StatusIcon tone={cloudStatus.tone} />
              {cloudStatus.text}
            </div>
          </div>

          <div className="p-5">
            {!cloudConfigured ? (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 p-4">
                <p className="font-bold">连接你的 Supabase 项目</p>
                <button className="k-button-primary mt-4 min-h-11" onClick={() => setShowConnection(true)}>
                  <Cloud size={17} />
                  设置云同步
                </button>
              </div>
            ) : cloudUser ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-xs font-bold text-kitchen-muted">当前账号</p>
                  <p className="mt-1 break-all text-lg font-black">{cloudUser.email ?? cloudUser.id}</p>
                  <p className="mt-1 text-sm text-kitchen-muted">
                    {cloudReady ? "修改会自动保存到云端。" : "云端数据尚未准备完成。"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="k-button-secondary min-h-11" onClick={() => setConfirmAction("upload")}>
                    <CloudUpload size={17} />
                    上传本机
                  </button>
                  <button className="k-button-secondary min-h-11" onClick={() => setConfirmAction("download")}>
                    <CloudDownload size={17} />
                    下载云端
                  </button>
                  <button className="k-button-secondary min-h-11" onClick={() => void signOutCloud()}>
                    <LogOut size={17} />
                    退出
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {isAutoConfigured ? (
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                    <p>
                      云同步连接已经内置到网站里。你只需要登录或创建账号，不同设备会使用同一套云端数据库。
                    </p>
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold">邮箱</span>
                    <input
                      className="k-input min-h-11"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold">密码</span>
                    <input
                      className="k-input min-h-11"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="至少 6 位"
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="k-button-primary min-h-11"
                    disabled={!email.trim() || password.length < 6}
                    onClick={() => void submitAuth("signin")}
                  >
                    <LogIn size={17} />
                    登录
                  </button>
                  <button
                    className="k-button-secondary min-h-11"
                    disabled={!email.trim() || password.length < 6}
                    onClick={() => void submitAuth("signup")}
                  >
                    <UserPlus size={17} />
                    创建账号
                  </button>
                </div>
              </div>
            )}

            <button
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kitchen-muted hover:text-kitchen-ink"
              onClick={() => setShowConnection((visible) => !visible)}
              aria-expanded={showConnection}
            >
              <SettingsIcon size={16} />
              连接设置
              <ChevronDown className={`transition ${showConnection ? "rotate-180" : ""}`} size={16} />
            </button>

            {showConnection ? (
              <form className="mt-3 grid gap-4 rounded-lg bg-stone-100 p-4" onSubmit={saveConnection}>
                {isAutoConfigured ? (
                  <div className="rounded-lg border border-green-200 bg-white p-3 text-sm text-green-800">
                    这组连接来自网站部署配置，所有用户第一次打开都会自动带上，不需要手动保存。
                  </div>
                ) : null}
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">Supabase Project URL</span>
                  <input
                    className="k-input min-h-11"
                    type="url"
                    value={configDraft.url}
                    onChange={(event) => setConfigDraft((config) => ({ ...config, url: event.target.value }))}
                    placeholder="https://xxxxx.supabase.co"
                    readOnly={isAutoConfigured}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">Publishable Key</span>
                  <input
                    className="k-input min-h-11"
                    type="password"
                    value={configDraft.publishableKey}
                    onChange={(event) =>
                      setConfigDraft((config) => ({ ...config, publishableKey: event.target.value }))
                    }
                    placeholder="sb_publishable_..."
                    readOnly={isAutoConfigured}
                    required
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {isAutoConfigured ? (
                    <button className="k-button-primary min-h-11" type="button" disabled>
                      <CheckCircle2 size={17} />
                      已自动配置
                    </button>
                  ) : (
                    <button className="k-button-primary min-h-11" type="submit">
                      保存连接
                    </button>
                  )}
                  {cloudConfigured && !isAutoConfigured ? (
                    <button
                      className="k-button-secondary min-h-11 text-red-600 hover:bg-red-50"
                      type="button"
                      onClick={() => {
                        clearCloudConfiguration();
                        setConfigDraft({ url: "", publishableKey: "" });
                      }}
                    >
                      清除连接
                    </button>
                  ) : null}
                </div>
              </form>
            ) : null}
          </div>
        </section>

        <div className="grid gap-4">
          <section className="k-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
              <SettingsIcon size={22} />
            </div>
            <h2 className="text-xl font-black">本地数据</h2>
            <p className="mt-2 text-sm text-kitchen-muted">
              无论是否登录，数据都会保留在当前浏览器中。登录后会额外保存一份云端版本。
            </p>
          </section>
        </div>
      </div>

      {confirmAction ? (
        <ConfirmDialog
          title={confirmCopy[confirmAction].title}
          description={confirmCopy[confirmAction].description}
          confirmLabel={confirmCopy[confirmAction].label}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => void runConfirmedAction()}
        />
      ) : null}
    </div>
  );
}
