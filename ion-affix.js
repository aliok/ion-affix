/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - <Ali Ok> - <Collin Donahue-Oponski>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Gist https://gist.github.com/colllin/1a0c3a91cc641d8e578f
.directive('affixWithinContainer', function($document, $ionicScrollDelegate) {

    var transition = function(element, dy, executeImmediately) {
        element.style[ionic.CSS.TRANSFORM] == 'translate3d(0, -' + dy + 'px, 0)' ||
        executeImmediately ?
            element.style[ionic.CSS.TRANSFORM] = 'translate3d(0, -' + dy + 'px, 0)' :
            ionic.requestAnimationFrame(function() {
                element.style[ionic.CSS.TRANSFORM] = 'translate3d(0, -' + dy + 'px, 0)';
            });
    };

    return {
        restrict: 'A',
        require: '^$ionicScroll',
        link: function($scope, $element, $attr, $ionicScroll) {
            var $affixContainer = $element.closest($attr.affixWithinContainer) || $element.parent();

            var top = 0;
            var height = 0;
            var scrollMin = 0;
            var scrollMax = 0;
            var scrollTransition = 0;
            var affixedHeight = 0;
            var updateScrollLimits = _.throttle(function(scrollTop) {
                top = $affixContainer.offset().top;
                height = $affixContainer.outerHeight(false);
                affixedHeight = $element.outerHeight(false);
                scrollMin = scrollTop + top;
                scrollMax = scrollMin + height;
                scrollTransition = scrollMax - affixedHeight;
            }, 500, {
                trailing: false
            });

            var affix = null;
            var unaffix = null;
            var $affixedClone = null;
            var setupAffix = function() {
                unaffix = null;
                affix = function() {
                    $affixedClone = $element.clone().css({
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0
                    });
                    $($ionicScroll.element).append($affixedClone);

                    setupUnaffix();
                };
            };
            var cleanupAffix = function() {
                $affixedClone && $affixedClone.remove();
                $affixedClone = null;
            };
            var setupUnaffix = function() {
                affix = null;
                unaffix = function() {
                    cleanupAffix();
                    setupAffix();
                };
            };
            $scope.$on('$destroy', cleanupAffix);
            setupAffix();

            var affixedJustNow;
            var scrollTop;
            $($ionicScroll.element).on('scroll', function(event) {
                scrollTop = (event.detail || event.originalEvent && event.originalEvent.detail).scrollTop;
                updateScrollLimits(scrollTop);
                if (scrollTop >= scrollMin && scrollTop <= scrollMax) {
                    affixedJustNow = affix ? affix() || true : false;
                    if (scrollTop > scrollTransition) {
                        transition($affixedClone[0], Math.floor(scrollTop-scrollTransition), affixedJustNow);
                    } else {
                        transition($affixedClone[0], 0, affixedJustNow);
                    }
                } else {
                    unaffix && unaffix();
                }
            });
        }
    }
});