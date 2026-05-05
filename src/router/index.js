import { createRouter, createWebHistory } from 'vue-router';
import { servicePages } from '@/data/servicePages';
import AdminPage from '@/views/AdminPage.vue';
import HomePage from '@/views/HomePage.vue';
import NotFoundPage from '@/views/NotFoundPage.vue';
import ServicePageView from '@/views/ServicePageView.vue';

const APP_TITLE = 'Центр налоговой аналитики недвижимости';

const serviceRoutes = servicePages.map((page) => ({
  path: page.path,
  name: page.slug,
  component: ServicePageView,
  props: {
    slug: page.slug
  },
  meta: {
    title: page.cardTitle,
    description: page.hero.description
  }
}));

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: APP_TITLE,
      description: 'Сервис управления налоговыми рисками в недвижимости'
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPage,
    meta: {
      title: 'Админ-панель контента',
      description: 'Серверное редактирование контента landing-страницы'
    }
  },
  ...serviceRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
    meta: {
      title: 'Страница не найдена',
      description: 'Маршрут не найден'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      };
    }

    return { top: 0 };
  }
});

router.afterEach((to) => {
  if (typeof document === 'undefined') {
    return;
  }

  const pageTitle =
    to.meta?.title && to.meta.title !== APP_TITLE
      ? `${to.meta.title} | ${APP_TITLE}`
      : APP_TITLE;
  document.title = pageTitle;

  const description = to.meta?.description || 'Сервис управления налоговыми рисками в недвижимости.';
  let metaDescription = document.querySelector('meta[name="description"]');

  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }

  metaDescription.setAttribute('content', description);
});

export default router;
