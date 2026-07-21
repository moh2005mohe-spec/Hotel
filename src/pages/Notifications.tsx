import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Trash2, CheckCircle, Circle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/utils'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export default function Notifications() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  async function fetchNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setNotifications(data ?? [])
    setLoading(false)
  }

  async function toggleRead(id: string, isRead: boolean) {
    await supabase
      .from('notifications')
      .update({ is_read: !isRead })
      .eq('id', id)

    setNotifications(ns =>
      ns.map(n => n.id === id ? { ...n, is_read: !isRead } : n)
    )
  }

  async function deleteNotification(id: string) {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    setNotifications(ns => ns.filter(n => n.id !== id))
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })))
  }

  async function deleteAll() {
    if (confirm('Supprimer toutes les notifications ?')) {
      await supabase
        .from('notifications')
        .delete()
        .neq('id', '')

      setNotifications([])
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('common.notifications')}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-neutral-500 mt-1">
              {unreadCount} {unreadCount === 1 ? 'notification non lue' : 'notifications non lues'}
            </p>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-lg transition"
              >
                Marquer comme lues
              </button>
            )}
            <button
              onClick={deleteAll}
              className="px-3 py-1.5 text-sm font-medium text-danger-600 bg-danger-100 hover:bg-danger-200 rounded-lg transition"
            >
              Tout supprimer
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-20 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={40} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`card p-4 flex items-start gap-4 transition ${
                n.is_read ? 'bg-neutral-50' : 'bg-primary-50 border-l-4 border-primary-500'
              }`}
            >
              <div className="pt-1">
                {n.is_read ? (
                  <Circle size={20} className="text-neutral-400" />
                ) : (
                  <CheckCircle size={20} className="text-primary-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900">{n.title}</h3>
                <p className="text-sm text-neutral-600 mt-1">{n.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-neutral-500">
                    {formatDate(n.created_at, lang)}
                  </span>
                  {n.link && (
                    <a
                      href={n.link}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Voir plus →
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleRead(n.id, n.is_read)}
                  title={n.is_read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                  className={`p-2 rounded-lg transition ${
                    n.is_read
                      ? 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                  }`}
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  onClick={() => deleteNotification(n.id)}
                  title="Supprimer"
                  className="p-2 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
