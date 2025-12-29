import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Upload, Phone, QrCode, Loader2, Check, X } from 'lucide-react';
import { authApi } from '../lib/api';
import { uploadApi } from '../lib/upload';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function UserProfileContact() {
  const { user, refreshUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [qrCode, setQrCode] = useState(user?.qrCode || '');
  const [qrCodeType, setQrCodeType] = useState(user?.qrCodeType || 'feishu');
  const [showPhone, setShowPhone] = useState(user?.showPhone ?? true);
  const [showQrCode, setShowQrCode] = useState(user?.showQrCode ?? true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleQrCodeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // 验证文件大小（最大2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过2MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setQrCode(url);
      toast.success('二维码上传成功');
    } catch (error: any) {
      console.error('二维码上传失败:', error);
      toast.error(error.message || '上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveQrCode = () => {
    setQrCode('');
    toast.success('已移除二维码');
  };

  const handleSave = async () => {
    // 电话号码格式验证（可选）
    if (phone && !/^1[3-9]\d{9}$/.test(phone.replace(/-/g, ''))) {
      toast.error('请输入正确的手机号码');
      return;
    }

    setIsSaving(true);
    try {
      await authApi.updateProfile({
        phone: phone || undefined,
        qrCode: qrCode || undefined,
        qrCodeType,
        showPhone,
        showQrCode,
      });

      // 刷新用户信息
      await refreshUser();
      
      toast.success('联系方式已更新');
    } catch (error: any) {
      console.error('更新失败:', error);
      toast.error(error.message || '更新失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="bg-white shadow-lg border-2 border-blue-100">
        <div className="p-8">
          {/* 标题区域 */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">联系方式设置</h3>
            <p className="text-slate-600">
              设置您的联系方式，方便他人在项目咨询时联系您
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 左侧：电话号码 */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">电话号码</h4>
                    <p className="text-sm text-slate-600">紧急联系方式</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700 mb-2 block">
                      手机号码
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="138-1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 text-lg border-2 border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={showPhone}
                        onCheckedChange={setShowPhone}
                        id="showPhone"
                      />
                      <Label htmlFor="showPhone" className="text-sm text-slate-700 cursor-pointer font-medium">
                        在项目中公开显示电话号码
                      </Label>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 ml-11">
                      开启后，查看项目的用户可以看到您的电话号码
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：二维码 */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">联系二维码</h4>
                    <p className="text-sm text-slate-600">飞书或微信</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 二维码类型选择 */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      二维码类型
                    </Label>
                    <Select value={qrCodeType} onValueChange={setQrCodeType}>
                      <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feishu">🚀 飞书</SelectItem>
                        <SelectItem value="wechat">💬 微信</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 二维码上传区 */}
                  <div className="flex justify-center">
                    {qrCode ? (
                      <div className="relative group">
                        <img
                          src={qrCode}
                          alt="联系二维码"
                          className="w-56 h-56 rounded-2xl border-4 border-white shadow-2xl"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={handleRemoveQrCode}
                        >
                          <X className="w-4 h-4 mr-1" />
                          移除
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="qrcode-upload"
                          accept="image/*"
                          onChange={handleQrCodeUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="qrcode-upload"
                          className="flex flex-col items-center justify-center w-56 h-56 border-3 border-dashed border-blue-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-100/50 transition-all bg-white shadow-lg"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-3" />
                              <span className="text-sm text-blue-600 font-medium">上传中...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-12 h-12 text-blue-400 mb-3" />
                              <span className="text-base text-blue-600 font-medium mb-1">点击上传二维码</span>
                              <span className="text-xs text-slate-400">PNG、JPG，最大2MB</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={showQrCode}
                        onCheckedChange={setShowQrCode}
                        id="showQrCode"
                      />
                      <Label htmlFor="showQrCode" className="text-sm text-slate-700 cursor-pointer font-medium">
                        在项目中公开显示二维码
                      </Label>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 ml-11">
                      开启后，用户可以扫码快速添加您
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 温馨提示 */}
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-amber-900 mb-2">温馨提示</h5>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>• 建议至少填写一种联系方式，方便他人咨询项目</li>
                  <li>• 二维码建议尺寸：400x400px，确保清晰可扫描</li>
                  <li>• 您可以随时修改隐私设置，控制是否公开联系方式</li>
                  <li>• 电话号码仅在您开启"公开显示"后才会展示给其他用户</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 保存按钮区域 */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    保存设置
                  </>
                )}
              </Button>
              <p className="text-sm text-slate-500">
                更新后，您创建的项目将显示最新的联系方式
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

