__author__ = 'J'

import math
import matplotlib.pyplot as plt

def plot_squashing_functions(lin, neg_lin, log, neg_log, exp, neg_exp):

    x = [i*0.02 for i in range(-25, 75)]
    plt_y_min = -0.1
    plt_y_max = 1.1

    if lin:
        linear = [0 for i in x[:26]]
        [linear.append(i) for i in x[26:76]]
        [linear.append(1) for i in x[76:]]

        plt.figure()
        plt.ylim([plt_y_min, plt_y_max])
        plt.xlim([-0.5, 1.5])
        plt.plot(x, linear, label='linear')
        plt.vlines(0, plt_y_min, plt_y_max, colors='r', label='Threshold')
        plt.vlines(1, plt_y_min, plt_y_max, colors='g', label='Objective')
        plt.legend(loc=0)
        plt.savefig('linear.svg')
        plt.close()
        
    if neg_lin:
        inverted_linear = [1 for i in x[:26]]
        [inverted_linear.append(-i + 1) for i in x[26:76]]
        [inverted_linear.append(0) for i in x[76:]]

        plt.figure()
        plt.ylim([plt_y_min, plt_y_max])
        plt.xlim([-0.5, 1.5])
        plt.plot(x, inverted_linear, label='neg linear')
        plt.vlines(0, plt_y_min, plt_y_max, colors='g', label='Objective')
        plt.vlines(1, plt_y_min, plt_y_max, colors='r', label='Threshold')
        plt.legend(loc=0)
        plt.savefig('neg_linear.svg')
        plt.close()
        
    if exp:
        exponential = [0 for i in x[:26]]
        [exponential.append((math.exp(2*i) - 1.0)/(math.exp(2) - 1.0)) for i in x[26:76]]
        [exponential.append(1) for i in x[76:]]

        plt.figure()
        plt.ylim([plt_y_min, plt_y_max])
        plt.xlim([-0.5, 1.5])
        plt.plot(x, exponential, label='exp')
        plt.vlines(0, plt_y_min, plt_y_max, colors='r', label='Threshold')
        plt.vlines(1, plt_y_min, plt_y_max, colors='g', label='Objective')
        plt.legend(loc=0)
        plt.savefig('exp.svg')
        plt.close()
        
    if neg_exp:
        inverted_exponential = [1 for i in x[:26]]
        [inverted_exponential.append((math.exp(-2*(i - 1.0)) - 1.0)/(math.exp(2) - 1.0)) for i in x[26:76]]
        [inverted_exponential.append(0) for i in x[76:]]

        plt.figure()
        plt.ylim([plt_y_min, plt_y_max])
        plt.xlim([-0.5, 1.5])
        plt.plot(x, inverted_exponential, label='neg exp')
        plt.vlines(0, plt_y_min, plt_y_max, colors='g', label='Objective')
        plt.vlines(1, plt_y_min, plt_y_max, colors='r', label='Threshold')
        plt.legend(loc=0)
        plt_name = 'neg_exp.svg'
        plt.savefig(plt_name)
        plt.close()
        
    if log:
        log = [0 for i in x[:26]]
        [log.append((math.log(5.0*(i + 0.2)))/math.log(6.0)) for i in x[26:76]]
        [log.append(1) for i in x[76:]]

        plt.figure()
        plt.ylim([plt_y_min, plt_y_max])
        plt.xlim([-0.5, 1.5])
        plt.plot(x, log, label='log')
        plt.vlines(0, plt_y_min, plt_y_max, colors='r', label='Threshold')
        plt.vlines(1, plt_y_min, plt_y_max, colors='g', label='Objective')
        plt.legend(loc=0)
        plt.savefig('log.svg')
        plt.close()
        
    if neg_log:
        inverted_log = [1 for i in x[:26]]
        #[inverted_log.append((math.log(-5.0*(i + 0.2) + 7))/math.log(6.0)) for i in x[26:76]]
        [inverted_log.append((math.log(-5.0*(i - 1.2)))/math.log(6.0)) for i in x[26:76]]
        [inverted_log.append(0) for i in x[76:]]

        plt.figure()
        plt.ylim([plt_y_min, plt_y_max])
        plt.xlim([-0.5, 1.5])
        plt.plot(x, inverted_log, label='neg log')
        plt.vlines(0, plt_y_min, plt_y_max, colors='g', label='Objective')
        plt.vlines(1, plt_y_min, plt_y_max, colors='r', label='Threshold')
        plt.legend(loc=0)
        plt.savefig('neg_log.svg')
        plt.close()


if __name__ == "__main__":

    plot_squashing_functions(True, True, True, True, True, True)
